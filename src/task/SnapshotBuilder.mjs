class SnapshotBuilder {


    static build( { endpoint, agentCard, categories } ) {
        const { name, description, version, provider, supported_interfaces: supportedInterfaces, default_input_modes: defaultInputModes, default_output_modes: defaultOutputModes, skills } = agentCard

        const protocolBindings = supportedInterfaces
            .map( ( iface ) => iface['protocol_binding'] )

        const firstInterface = supportedInterfaces[0]
        const protocolVersion = firstInterface['protocol_version']

        const skillsSummary = skills
            .map( ( skill ) => {
                const { id, name: skillName } = skill

                return { id, name: skillName }
            } )

        const entries = {
            url: endpoint,
            agentName: name,
            agentDescription: description,
            agentVersion: version,
            providerOrganization: provider ? provider['organization'] : null,
            providerUrl: provider ? provider['url'] : null,
            skillCount: skills.length,
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
