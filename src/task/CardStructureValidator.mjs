class CardStructureValidator {


    static validate( { agentCard } ) {
        const struct = { status: false, findings: [] }

        const requiredTopLevel = [
            [ 'name', 'CSV-020' ],
            [ 'description', 'CSV-021' ],
            [ 'version', 'CSV-022' ],
            [ 'supported_interfaces', 'CSV-023' ],
            [ 'capabilities', 'CSV-025' ],
            [ 'default_input_modes', 'CSV-026' ],
            [ 'default_output_modes', 'CSV-027' ],
            [ 'skills', 'CSV-028' ]
        ]

        requiredTopLevel
            .forEach( ( [ field, code ] ) => {
                if( agentCard[field] === undefined || agentCard[field] === null ) {
                    struct['findings'].push( { code, severity: 'warning', location: field, message: `Missing required field "${field}"` } )
                }
            } )

        if( struct['findings'].length > 0 ) {
            return struct
        }

        const { supported_interfaces: supportedInterfaces, skills, provider } = agentCard

        if( !Array.isArray( supportedInterfaces ) || supportedInterfaces.length === 0 ) {
            struct['findings'].push( { code: 'CSV-024', severity: 'warning', location: 'supported_interfaces', message: 'Must not be empty' } )
        }

        if( struct['findings'].length > 0 ) {
            return struct
        }

        CardStructureValidator.#validateInterfaces( { supportedInterfaces, struct } )
        CardStructureValidator.#validateSkills( { skills, struct } )

        if( provider !== undefined && provider !== null ) {
            CardStructureValidator.#validateProvider( { provider, struct } )
        }

        if( struct['findings'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static #validateInterfaces( { supportedInterfaces, struct } ) {
        supportedInterfaces
            .forEach( ( iface, index ) => {
                if( iface['url'] === undefined || iface['url'] === null ) {
                    struct['findings'].push( { code: 'CSV-030', severity: 'warning', location: `supported_interfaces[${index}].url`, message: 'Missing value' } )
                } else {
                    try {
                        const parsed = new URL( iface['url'] )
                        const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'

                        if( parsed.protocol !== 'https:' && !isLocal ) {
                            struct['findings'].push( { code: 'CSV-031', severity: 'warning', location: `supported_interfaces[${index}].url`, message: 'Must be a valid HTTPS URL' } )
                        }
                    } catch( _e ) {
                        struct['findings'].push( { code: 'CSV-031', severity: 'warning', location: `supported_interfaces[${index}].url`, message: 'Must be a valid HTTPS URL' } )
                    }
                }

                if( iface['protocol_binding'] === undefined || iface['protocol_binding'] === null ) {
                    struct['findings'].push( { code: 'CSV-032', severity: 'warning', location: `supported_interfaces[${index}].protocol_binding`, message: 'Missing value' } )
                }

                if( iface['protocol_version'] === undefined || iface['protocol_version'] === null ) {
                    struct['findings'].push( { code: 'CSV-033', severity: 'warning', location: `supported_interfaces[${index}].protocol_version`, message: 'Missing value' } )
                }
            } )
    }


    static #validateSkills( { skills, struct } ) {
        skills
            .forEach( ( skill, index ) => {
                if( skill['id'] === undefined || skill['id'] === null ) {
                    struct['findings'].push( { code: 'CSV-034', severity: 'warning', location: `skills[${index}].id`, message: 'Missing value' } )
                }

                if( skill['name'] === undefined || skill['name'] === null ) {
                    struct['findings'].push( { code: 'CSV-035', severity: 'warning', location: `skills[${index}].name`, message: 'Missing value' } )
                }

                if( skill['description'] === undefined || skill['description'] === null ) {
                    struct['findings'].push( { code: 'CSV-036', severity: 'warning', location: `skills[${index}].description`, message: 'Missing value' } )
                }

                if( skill['tags'] === undefined || skill['tags'] === null ) {
                    struct['findings'].push( { code: 'CSV-037', severity: 'warning', location: `skills[${index}].tags`, message: 'Missing value' } )
                } else if( !Array.isArray( skill['tags'] ) || skill['tags'].length === 0 ) {
                    struct['findings'].push( { code: 'CSV-038', severity: 'warning', location: `skills[${index}].tags`, message: 'Must be a non-empty array' } )
                }
            } )
    }


    static #validateProvider( { provider, struct } ) {
        if( provider['url'] === undefined || provider['url'] === null ) {
            struct['findings'].push( { code: 'CSV-040', severity: 'warning', location: 'provider.url', message: 'Missing value' } )
        }

        if( provider['organization'] === undefined || provider['organization'] === null ) {
            struct['findings'].push( { code: 'CSV-041', severity: 'warning', location: 'provider.organization', message: 'Missing value' } )
        }
    }
}


export { CardStructureValidator }
