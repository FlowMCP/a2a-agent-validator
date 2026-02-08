class SnapshotBuilder {


    static build( { endpoint, agentCard, categories } ) {
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
            hasDocumentation: false
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
            timestamp: new Date().toISOString()
        }

        return { categories, entries }
    }
}


export { SnapshotBuilder }
