class SnapshotBuilder {


    static build( { endpoint, agentCard, categories, extensions = null } ) {
        const { name, description, version, provider, supported_interfaces: supportedInterfaces, default_input_modes: defaultInputModes, default_output_modes: defaultOutputModes, skills } = agentCard

        const protocolBindings = Array.isArray( supportedInterfaces )
            ? supportedInterfaces.map( ( iface ) => iface['protocol_binding'] )
            : []

        const firstInterface = Array.isArray( supportedInterfaces ) && supportedInterfaces.length > 0
            ? supportedInterfaces[0]
            : null
        const protocolVersion = firstInterface ? firstInterface['protocol_version'] : null

        const skillsSummary = Array.isArray( skills )
            ? skills.map( ( skill ) => {
                const { id, name: skillName } = skill

                return { id, name: skillName }
            } )
            : []

        const ap2Version = SnapshotBuilder.#extractAp2Version( { extensions, agentCard } )
        const ap2Roles = SnapshotBuilder.#extractAp2Roles( { agentCard } )
        const x402Version = SnapshotBuilder.#extractX402Version( { extensions, agentCard } )
        const erc8004ServiceUrl = SnapshotBuilder.#extractErc8004ServiceUrl( { agentCard } )

        const entries = {
            url: endpoint,
            agentName: name,
            agentDescription: description,
            agentVersion: version,
            providerOrganization: provider ? provider['organization'] : null,
            providerUrl: provider ? provider['url'] : null,
            skillCount: Array.isArray( skills ) ? skills.length : 0,
            skills: skillsSummary,
            protocolBindings,
            protocolVersion,
            defaultInputModes: defaultInputModes,
            defaultOutputModes: defaultOutputModes,
            ap2Version,
            ap2Roles,
            x402Version,
            erc8004ServiceUrl,
            extensions,
            timestamp: new Date().toISOString()
        }

        return { categories, entries }
    }


    static buildEmpty( { endpoint } ) {
        const categories = {
            isReachable: false,
            hasAgentCard: false,
            hasValidStructure: false,
            hasSkills: false,
            hasSecuritySchemes: false,
            hasProvider: false,
            supportsStreaming: false,
            supportsPushNotifications: false,
            supportsJsonRpc: false,
            supportsGrpc: false,
            supportsExtendedCard: false,
            hasDocumentation: false,
            supportsAp2: false,
            supportsX402: false,
            supportsEmbeddedFlow: false,
            hasErc8004ServiceLink: false
        }

        const entries = {
            url: endpoint,
            agentName: null,
            agentDescription: null,
            agentVersion: null,
            providerOrganization: null,
            providerUrl: null,
            skillCount: null,
            skills: null,
            protocolBindings: null,
            protocolVersion: null,
            defaultInputModes: null,
            defaultOutputModes: null,
            ap2Version: null,
            ap2Roles: null,
            x402Version: null,
            erc8004ServiceUrl: null,
            extensions: null,
            timestamp: new Date().toISOString()
        }

        return { categories, entries }
    }


    static #extractAp2Version( { extensions, agentCard } ) {
        const cardExtensions = agentCard['capabilities'] && Array.isArray( agentCard['capabilities']['extensions'] )
            ? agentCard['capabilities']['extensions']
            : []

        const ap2Ext = cardExtensions
            .find( ( ext ) => {
                const uri = typeof ext === 'string' ? ext : ( ext['uri'] || '' )
                const lowerUri = uri.toLowerCase()

                return lowerUri.includes( 'ap2' ) || lowerUri.includes( 'agentic-commerce' ) || lowerUri.includes( 'agent-payments' )
            } )

        if( ap2Ext ) {
            const uri = typeof ap2Ext === 'string' ? ap2Ext : ( ap2Ext['uri'] || '' )
            const match = uri.match( /\/v?([\d.]+)/ )

            if( match ) {
                return match[1]
            }
        }

        if( typeof extensions === 'string' && extensions.length > 0 ) {
            const match = extensions.match( /ap2[^,]*?\/v?([\d.]+)/i )

            return match ? match[1] : null
        }

        return null
    }


    static #extractAp2Roles( { agentCard } ) {
        const cardExtensions = agentCard['capabilities'] && Array.isArray( agentCard['capabilities']['extensions'] )
            ? agentCard['capabilities']['extensions']
            : []

        const ap2Ext = cardExtensions
            .find( ( ext ) => {
                if( typeof ext === 'string' ) { return false }

                const uri = ( ext['uri'] || '' ).toLowerCase()

                return uri.includes( 'ap2' ) || uri.includes( 'agentic-commerce' ) || uri.includes( 'agent-payments' )
            } )

        if( ap2Ext && ap2Ext['params'] && Array.isArray( ap2Ext['params']['roles'] ) && ap2Ext['params']['roles'].length > 0 ) {
            return ap2Ext['params']['roles']
        }

        return null
    }


    static #extractX402Version( { extensions, agentCard } ) {
        const cardExtensions = agentCard['capabilities'] && Array.isArray( agentCard['capabilities']['extensions'] )
            ? agentCard['capabilities']['extensions']
            : []

        const x402Ext = cardExtensions
            .find( ( ext ) => {
                const uri = typeof ext === 'string' ? ext : ( ext['uri'] || '' )
                const lowerUri = uri.toLowerCase()

                return lowerUri.includes( 'x402' ) || lowerUri.includes( 'a2a-x402' )
            } )

        if( x402Ext ) {
            const uri = typeof x402Ext === 'string' ? x402Ext : ( x402Ext['uri'] || '' )
            const match = uri.match( /\/v?([\d.]+)/ )

            if( match ) {
                return match[1]
            }
        }

        if( typeof extensions === 'string' && extensions.length > 0 ) {
            const match = extensions.match( /x402[^,]*?\/v?([\d.]+)/i )

            return match ? match[1] : null
        }

        return null
    }


    static #extractErc8004ServiceUrl( { agentCard } ) {
        const services = Array.isArray( agentCard['services'] )
            ? agentCard['services']
            : []

        const found = services
            .find( ( service ) => {
                const type = ( service['type'] || '' ).toLowerCase()

                return type.includes( 'erc8004' ) || type.includes( 'erc-8004' )
            } )

        return found ? ( found['url'] || null ) : null
    }
}


export { SnapshotBuilder }
