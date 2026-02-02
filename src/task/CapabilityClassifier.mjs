class CapabilityClassifier {


    static classify( { agentCard } ) {
        const { capabilities, skills, security_schemes: securitySchemes, provider, supported_interfaces: supportedInterfaces, documentation_url: documentationUrl } = agentCard

        const protocolBindings = supportedInterfaces
            .map( ( iface ) => iface['protocol_binding'] )

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
            hasDocumentation: documentationUrl !== undefined && documentationUrl !== null && documentationUrl !== ''
        }

        return { categories }
    }
}


export { CapabilityClassifier }
