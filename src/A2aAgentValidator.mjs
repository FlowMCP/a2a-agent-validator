import { A2aConnector } from './task/A2aConnector.mjs'
import { CapabilityClassifier } from './task/CapabilityClassifier.mjs'
import { CardStructureValidator } from './task/CardStructureValidator.mjs'
import { SnapshotBuilder } from './task/SnapshotBuilder.mjs'
import { Validation } from './task/Validation.mjs'


class A2aAgentValidator {


    static async validate( { endpoint } ) {
        const { status: validationStatus, findings: validationFindings } = Validation.validationValidate( { endpoint } )
        if( !validationStatus ) { Validation.error( { findings: validationFindings } ) }

        const { status: fetchStatus, findings: fetchFindings, agentCard } = await A2aConnector.fetch( { endpoint, timeout: 10000 } )

        if( !fetchStatus ) {
            const findings = [ ...fetchFindings ]

            return { status: false, findings }
        }

        const { findings: structureFindings } = CardStructureValidator.validate( { agentCard } )

        const allFindings = [ ...fetchFindings, ...structureFindings ]
        const status = allFindings.length === 0

        return { status, findings: allFindings }
    }


    static async start( { endpoint, timeout = 10000 } ) {
        const { status: validationStatus, findings: validationFindings } = Validation.validationStart( { endpoint, timeout } )
        if( !validationStatus ) { Validation.error( { findings: validationFindings } ) }

        const { status: fetchStatus, findings: fetchFindings, agentCard, extensions } = await A2aConnector.fetch( { endpoint, timeout } )

        if( !fetchStatus ) {
            const { categories, entries } = SnapshotBuilder.buildEmpty( { endpoint } )
            const findings = [ ...fetchFindings ]

            return { status: false, findings, categories, entries }
        }

        const { findings: structureFindings } = CardStructureValidator.validate( { agentCard } )

        if( structureFindings.length > 0 ) {
            const { categories, entries } = SnapshotBuilder.buildEmpty( { endpoint } )
            categories['isReachable'] = true
            categories['hasAgentCard'] = true
            const allFindings = [ ...fetchFindings, ...structureFindings ]

            return { status: false, findings: allFindings, categories, entries }
        }

        const { categories } = CapabilityClassifier.classify( { agentCard, extensions } )
        const { categories: snapshotCategories, entries } = SnapshotBuilder.build( { endpoint, agentCard, categories, extensions } )

        const allFindings = [ ...fetchFindings, ...structureFindings ]
        const status = allFindings.length === 0

        return { status, findings: allFindings, categories: snapshotCategories, entries }
    }


    static compare( { before, after } ) {
        const { status: validationStatus, findings: validationFindings } = Validation.validationCompare( { before, after } )
        if( !validationStatus ) { Validation.error( { findings: validationFindings } ) }

        const findings = []

        A2aAgentValidator.#checkSnapshotIntegrity( { before, after, findings } )

        const { diff: identityDiff } = A2aAgentValidator.#diffIdentity( { before: before['entries'], after: after['entries'] } )
        const { diff: capabilitiesDiff } = A2aAgentValidator.#diffCapabilities( { before: before['categories'], after: after['categories'] } )
        const { diff: skillsDiff } = A2aAgentValidator.#diffSkills( { before: before['entries']['skills'] || [], after: after['entries']['skills'] || [] } )
        const { diff: interfacesDiff } = A2aAgentValidator.#diffInterfaces( { before: before['entries']['protocolBindings'] || [], after: after['entries']['protocolBindings'] || [] } )
        const { diff: securityDiff } = A2aAgentValidator.#diffSecurity( { before, after } )
        const { diff: categoriesDiff } = A2aAgentValidator.#diffCategories( { before: before['categories'], after: after['categories'] } )

        const hasChanges = A2aAgentValidator.#hasAnyChanges( { identityDiff, capabilitiesDiff, skillsDiff, interfacesDiff, securityDiff, categoriesDiff } )

        const diff = {
            identity: identityDiff,
            capabilities: capabilitiesDiff,
            skills: skillsDiff,
            interfaces: interfacesDiff,
            security: securityDiff,
            categories: categoriesDiff
        }

        const status = true

        return { status, findings, hasChanges, diff }
    }


    static #checkSnapshotIntegrity( { before, after, findings } ) {
        const beforeUrl = before['entries']['url']
        const afterUrl = after['entries']['url']

        if( beforeUrl !== afterUrl ) {
            findings.push( { code: 'CMP-001', severity: 'warning', location: 'compare', message: 'Snapshots are from different agents' } )
        }

        const beforeTimestamp = before['entries']['timestamp']
        const afterTimestamp = after['entries']['timestamp']

        if( !beforeTimestamp ) {
            findings.push( { code: 'CMP-002', severity: 'warning', location: 'compare', message: 'Before snapshot has no timestamp' } )
        }

        if( beforeTimestamp && afterTimestamp && afterTimestamp < beforeTimestamp ) {
            findings.push( { code: 'CMP-003', severity: 'warning', location: 'compare', message: 'After snapshot is older than before' } )
        }
    }


    static #diffIdentity( { before, after } ) {
        const changed = {}

        const fields = [ 'agentName', 'agentVersion', 'agentDescription' ]

        fields
            .forEach( ( field ) => {
                const beforeVal = before[field] || null
                const afterVal = after[field] || null

                if( beforeVal !== afterVal ) {
                    changed[field] = { before: beforeVal, after: afterVal }
                }
            } )

        return { diff: { changed } }
    }


    static #diffCapabilities( { before, after } ) {
        const changed = {}

        const fields = [ 'supportsStreaming', 'supportsPushNotifications', 'supportsExtendedCard', 'supportsAp2', 'supportsX402', 'supportsEmbeddedFlow', 'hasErc8004ServiceLink' ]

        fields
            .forEach( ( field ) => {
                if( before[field] !== after[field] ) {
                    changed[field] = { before: before[field], after: after[field] }
                }
            } )

        return { diff: { changed } }
    }


    static #diffSkills( { before, after } ) {
        const beforeIds = before
            .map( ( s ) => s['id'] )

        const afterIds = after
            .map( ( s ) => s['id'] )

        const added = afterIds
            .filter( ( id ) => !beforeIds.includes( id ) )

        const removed = beforeIds
            .filter( ( id ) => !afterIds.includes( id ) )

        const modified = []

        afterIds
            .filter( ( id ) => beforeIds.includes( id ) )
            .forEach( ( id ) => {
                const beforeSkill = before.find( ( s ) => s['id'] === id )
                const afterSkill = after.find( ( s ) => s['id'] === id )

                if( beforeSkill['name'] !== afterSkill['name'] ) {
                    modified.push( { id, field: 'name', before: beforeSkill['name'], after: afterSkill['name'] } )
                }
            } )

        return { diff: { added, removed, modified } }
    }


    static #diffInterfaces( { before, after } ) {
        const added = after
            .filter( ( binding ) => !before.includes( binding ) )

        const removed = before
            .filter( ( binding ) => !after.includes( binding ) )

        return { diff: { added, removed } }
    }


    static #diffSecurity( { before, after } ) {
        const beforeKeys = Object.keys( before['entries']['securitySchemes'] || {} )
        const afterKeys = Object.keys( after['entries']['securitySchemes'] || {} )

        const added = afterKeys
            .filter( ( key ) => !beforeKeys.includes( key ) )

        const removed = beforeKeys
            .filter( ( key ) => !afterKeys.includes( key ) )

        return { diff: { added, removed } }
    }


    static #diffCategories( { before, after } ) {
        const changed = {}

        Object.keys( before )
            .forEach( ( key ) => {
                if( before[key] !== after[key] ) {
                    changed[key] = { before: before[key], after: after[key] }
                }
            } )

        return { diff: { changed } }
    }


    static #hasAnyChanges( { identityDiff, capabilitiesDiff, skillsDiff, interfacesDiff, securityDiff, categoriesDiff } ) {
        const identityChanged = Object.keys( identityDiff['changed'] ).length > 0
        const capsChanged = Object.keys( capabilitiesDiff['changed'] ).length > 0
        const skillsChanged = skillsDiff['added'].length > 0 || skillsDiff['removed'].length > 0 || skillsDiff['modified'].length > 0
        const interfacesChanged = interfacesDiff['added'].length > 0 || interfacesDiff['removed'].length > 0
        const securityChanged = securityDiff['added'].length > 0 || securityDiff['removed'].length > 0
        const categoriesChanged = Object.keys( categoriesDiff['changed'] ).length > 0

        const hasChanges = identityChanged || capsChanged || skillsChanged || interfacesChanged || securityChanged || categoriesChanged

        return hasChanges
    }
}


export { A2aAgentValidator }
