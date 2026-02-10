class CapabilityClassifier {


    static classify( { agentCard, extensions = null } ) {
        const { capabilities, skills, security_schemes: securitySchemes, provider, supported_interfaces: supportedInterfaces, documentation_url: documentationUrl } = agentCard

        const protocolBindings = Array.isArray( supportedInterfaces )
            ? supportedInterfaces.map( ( iface ) => iface['protocol_binding'] )
            : []

        const categories = {
            isReachable: true,
            hasAgentCard: true,
            hasValidStructure: true,
            hasSkills: Array.isArray( skills ) && skills.length > 0,
            hasSecuritySchemes: securitySchemes !== undefined && securitySchemes !== null && Object.keys( securitySchemes ).length > 0,
            hasProvider: provider !== undefined && provider !== null,
            supportsStreaming: capabilities['streaming'] === true,
            supportsPushNotifications: capabilities['push_notifications'] === true,
            supportsJsonRpc: protocolBindings.includes( 'JSONRPC' ),
            supportsGrpc: protocolBindings.includes( 'GRPC' ),
            supportsExtendedCard: capabilities['extended_agent_card'] === true,
            hasDocumentation: documentationUrl !== undefined && documentationUrl !== null && documentationUrl !== '',
            supportsAp2: CapabilityClassifier.#detectAp2Extension( { extensions, agentCard } ),
            hasErc8004ServiceLink: CapabilityClassifier.#detectErc8004Service( { agentCard } )
        }

        return { categories }
    }


    static #detectAp2Extension( { extensions, agentCard } ) {
        if( typeof extensions === 'string' && extensions.length > 0 ) {
            const lower = extensions.toLowerCase()

            if( lower.includes( 'ap2' ) || lower.includes( 'agentic-commerce' ) || lower.includes( 'agent-payments' ) ) {
                return true
            }
        }

        const cardExtensions = agentCard['capabilities'] && Array.isArray( agentCard['capabilities']['extensions'] )
            ? agentCard['capabilities']['extensions']
            : []

        const found = cardExtensions
            .find( ( ext ) => {
                const uri = typeof ext === 'string' ? ext : ( ext['uri'] || '' )
                const lowerUri = uri.toLowerCase()

                return lowerUri.includes( 'ap2' ) || lowerUri.includes( 'agentic-commerce' ) || lowerUri.includes( 'agent-payments' )
            } )

        return found !== undefined
    }


    static #detectErc8004Service( { agentCard } ) {
        const services = Array.isArray( agentCard['services'] )
            ? agentCard['services']
            : []

        const foundInServices = services
            .find( ( service ) => {
                const type = ( service['type'] || '' ).toLowerCase()

                return type.includes( 'erc8004' ) || type.includes( 'erc-8004' )
            } )

        if( foundInServices !== undefined ) {
            return true
        }

        const supportedInterfaces = Array.isArray( agentCard['supported_interfaces'] )
            ? agentCard['supported_interfaces']
            : []

        const foundInInterfaces = supportedInterfaces
            .find( ( iface ) => {
                const binding = ( iface['protocol_binding'] || '' ).toLowerCase()

                return binding.includes( 'erc8004' ) || binding.includes( 'erc-8004' )
            } )

        return foundInInterfaces !== undefined
    }
}


export { CapabilityClassifier }
