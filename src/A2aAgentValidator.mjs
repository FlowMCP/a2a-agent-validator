import { A2aConnector } from './task/A2aConnector.mjs'
import { CapabilityClassifier } from './task/CapabilityClassifier.mjs'
import { CardStructureValidator } from './task/CardStructureValidator.mjs'
import { SnapshotBuilder } from './task/SnapshotBuilder.mjs'
import { Validation } from './task/Validation.mjs'


class A2aAgentValidator {


    static async validate( { endpoint } ) {
        const { status: validationStatus, messages: validationMessages } = Validation.validationValidate( { endpoint } )
        if( !validationStatus ) { Validation.error( { messages: validationMessages } ) }

        const { status: fetchStatus, messages: fetchMessages, agentCard } = await A2aConnector.fetch( { endpoint, timeout: 10000 } )

        if( !fetchStatus ) {
            const messages = [ ...fetchMessages ]

            return { status: false, messages }
        }

        const { messages: structureMessages } = CardStructureValidator.validate( { agentCard } )

        const allMessages = [ ...fetchMessages, ...structureMessages ]
        const status = allMessages.length === 0

        return { status, messages: allMessages }
    }


    static async start( { endpoint, timeout = 10000 } ) {
        const { status: validationStatus, messages: validationMessages } = Validation.validationStart( { endpoint, timeout } )
        if( !validationStatus ) { Validation.error( { messages: validationMessages } ) }

        const { status: fetchStatus, messages: fetchMessages, agentCard } = await A2aConnector.fetch( { endpoint, timeout } )

        if( !fetchStatus ) {
            const { categories, entries } = SnapshotBuilder.buildEmpty( { endpoint } )
            const messages = [ ...fetchMessages ]

            return { status: false, messages, categories, entries }
        }

        const { messages: structureMessages } = CardStructureValidator.validate( { agentCard } )

        const { categories } = CapabilityClassifier.classify( { agentCard } )
        const { categories: snapshotCategories, entries } = SnapshotBuilder.build( { endpoint, agentCard, categories } )

        const allMessages = [ ...fetchMessages, ...structureMessages ]
        const status = allMessages.length === 0

        return { status, messages: allMessages, categories: snapshotCategories, entries }
    }


    static compare( { before, after } ) {
        const { status: validationStatus, messages: validationMessages } = Validation.validationCompare( { before, after } )
        if( !validationStatus ) { Validation.error( { messages: validationMessages } ) }

        const messages = []

        A2aAgentValidator.#checkSnapshotIntegrity( { before, after, messages } )

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

        return { status, messages, hasChanges, diff }
    }


    static #checkSnapshotIntegrity( { before, after, messages } ) {
        const beforeUrl = before['entries']['url']
        const afterUrl = after['entries']['url']

        if( beforeUrl !== afterUrl ) {
            messages.push( 'CMP-001 compare: Snapshots are from different agents' )
        }

        const beforeTimestamp = before['entries']['timestamp']
        const afterTimestamp = after['entries']['timestamp']

        if( !beforeTimestamp ) {
            messages.push( 'CMP-002 compare: Before snapshot has no timestamp' )
        }

        if( beforeTimestamp && afterTimestamp && afterTimestamp < beforeTimestamp ) {
            messages.push( 'CMP-003 compare: After snapshot is older than before' )
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

        const fields = [ 'supportsStreaming', 'supportsPushNotifications', 'supportsExtendedCard' ]

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
