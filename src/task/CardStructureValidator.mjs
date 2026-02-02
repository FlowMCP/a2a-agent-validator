class CardStructureValidator {


    static validate( { agentCard } ) {
        const struct = { status: false, messages: [] }

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
                    struct['messages'].push( `${code}: Missing required field "${field}"` )
                }
            } )

        if( struct['messages'].length > 0 ) {
            return struct
        }

        const { supported_interfaces: supportedInterfaces, skills, provider } = agentCard

        if( !Array.isArray( supportedInterfaces ) || supportedInterfaces.length === 0 ) {
            struct['messages'].push( 'CSV-024: supported_interfaces must not be empty' )
        }

        if( struct['messages'].length > 0 ) {
            return struct
        }

        CardStructureValidator.#validateInterfaces( { supportedInterfaces, struct } )
        CardStructureValidator.#validateSkills( { skills, struct } )

        if( provider !== undefined && provider !== null ) {
            CardStructureValidator.#validateProvider( { provider, struct } )
        }

        if( struct['messages'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static #validateInterfaces( { supportedInterfaces, struct } ) {
        supportedInterfaces
            .forEach( ( iface, index ) => {
                if( iface['url'] === undefined || iface['url'] === null ) {
                    struct['messages'].push( `CSV-030: supported_interfaces[${index}].url: Missing value` )
                } else {
                    try {
                        const parsed = new URL( iface['url'] )

                        if( parsed.protocol !== 'https:' ) {
                            struct['messages'].push( `CSV-031: supported_interfaces[${index}].url: Must be a valid HTTPS URL` )
                        }
                    } catch( _e ) {
                        struct['messages'].push( `CSV-031: supported_interfaces[${index}].url: Must be a valid HTTPS URL` )
                    }
                }

                if( iface['protocol_binding'] === undefined || iface['protocol_binding'] === null ) {
                    struct['messages'].push( `CSV-032: supported_interfaces[${index}].protocol_binding: Missing value` )
                }

                if( iface['protocol_version'] === undefined || iface['protocol_version'] === null ) {
                    struct['messages'].push( `CSV-033: supported_interfaces[${index}].protocol_version: Missing value` )
                }
            } )
    }


    static #validateSkills( { skills, struct } ) {
        skills
            .forEach( ( skill, index ) => {
                if( skill['id'] === undefined || skill['id'] === null ) {
                    struct['messages'].push( `CSV-034: skills[${index}].id: Missing value` )
                }

                if( skill['name'] === undefined || skill['name'] === null ) {
                    struct['messages'].push( `CSV-035: skills[${index}].name: Missing value` )
                }

                if( skill['description'] === undefined || skill['description'] === null ) {
                    struct['messages'].push( `CSV-036: skills[${index}].description: Missing value` )
                }

                if( skill['tags'] === undefined || skill['tags'] === null ) {
                    struct['messages'].push( `CSV-037: skills[${index}].tags: Missing value` )
                } else if( !Array.isArray( skill['tags'] ) || skill['tags'].length === 0 ) {
                    struct['messages'].push( `CSV-038: skills[${index}].tags: Must be a non-empty array` )
                }
            } )
    }


    static #validateProvider( { provider, struct } ) {
        if( provider['url'] === undefined || provider['url'] === null ) {
            struct['messages'].push( 'CSV-040: provider.url: Missing value' )
        }

        if( provider['organization'] === undefined || provider['organization'] === null ) {
            struct['messages'].push( 'CSV-041: provider.organization: Missing value' )
        }
    }
}


export { CardStructureValidator }
