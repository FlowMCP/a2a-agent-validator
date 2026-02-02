import { CardStructureValidator } from '../../../src/task/CardStructureValidator.mjs'
import { VALID_AGENT_CARD, MINIMAL_AGENT_CARD } from '../../helpers/config.mjs'


describe( 'CardStructureValidator', () => {

    describe( 'validate — valid cards', () => {

        test( 'returns status true for valid full agent card', () => {
            const { status, messages } = CardStructureValidator.validate( { agentCard: VALID_AGENT_CARD } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )


        test( 'returns status true for minimal agent card', () => {
            const { status, messages } = CardStructureValidator.validate( { agentCard: MINIMAL_AGENT_CARD } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )
    } )


    describe( 'validate — missing top-level fields', () => {

        test( 'returns CSV-020 when name is missing', () => {
            const { name, ...card } = VALID_AGENT_CARD
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-020: Missing required field "name"' )
        } )


        test( 'returns CSV-021 when description is missing', () => {
            const { description, ...card } = VALID_AGENT_CARD
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-021: Missing required field "description"' )
        } )


        test( 'returns CSV-022 when version is missing', () => {
            const { version, ...card } = VALID_AGENT_CARD
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-022: Missing required field "version"' )
        } )


        test( 'returns CSV-023 when supported_interfaces is missing', () => {
            const { supported_interfaces, ...card } = VALID_AGENT_CARD
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-023: Missing required field "supported_interfaces"' )
        } )


        test( 'returns CSV-025 when capabilities is missing', () => {
            const { capabilities, ...card } = VALID_AGENT_CARD
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-025: Missing required field "capabilities"' )
        } )


        test( 'returns CSV-026 when default_input_modes is missing', () => {
            const { default_input_modes, ...card } = VALID_AGENT_CARD
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-026: Missing required field "default_input_modes"' )
        } )


        test( 'returns CSV-027 when default_output_modes is missing', () => {
            const { default_output_modes, ...card } = VALID_AGENT_CARD
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-027: Missing required field "default_output_modes"' )
        } )


        test( 'returns CSV-028 when skills is missing', () => {
            const { skills, ...card } = VALID_AGENT_CARD
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-028: Missing required field "skills"' )
        } )


        test( 'collects multiple missing fields', () => {
            const { name, description, version, ...card } = VALID_AGENT_CARD
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toHaveLength( 3 )
        } )
    } )


    describe( 'validate — supported_interfaces validation', () => {

        test( 'returns CSV-024 when supported_interfaces is empty', () => {
            const card = { ...VALID_AGENT_CARD, supported_interfaces: [] }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-024: supported_interfaces must not be empty' )
        } )


        test( 'returns CSV-030 when interface url is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { protocol_binding: 'JSONRPC', protocol_version: '0.3' } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-030: supported_interfaces[0].url: Missing value' )
        } )


        test( 'returns CSV-031 when interface url is not HTTPS', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { url: 'http://agent.example.com/a2a', protocol_binding: 'JSONRPC', protocol_version: '0.3' } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-031: supported_interfaces[0].url: Must be a valid HTTPS URL' )
        } )


        test( 'returns CSV-031 when interface url is not a valid URL', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { url: 'not-a-url', protocol_binding: 'JSONRPC', protocol_version: '0.3' } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-031: supported_interfaces[0].url: Must be a valid HTTPS URL' )
        } )


        test( 'returns CSV-032 when protocol_binding is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { url: 'https://agent.example.com/a2a', protocol_version: '0.3' } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-032: supported_interfaces[0].protocol_binding: Missing value' )
        } )


        test( 'returns CSV-033 when protocol_version is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { url: 'https://agent.example.com/a2a', protocol_binding: 'JSONRPC' } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-033: supported_interfaces[0].protocol_version: Missing value' )
        } )


        test( 'validates multiple interfaces with correct index', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [
                    { url: 'https://agent.example.com/a2a', protocol_binding: 'JSONRPC', protocol_version: '0.3' },
                    { protocol_binding: 'GRPC', protocol_version: '0.3' }
                ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-030: supported_interfaces[1].url: Missing value' )
        } )
    } )


    describe( 'validate — skills validation', () => {

        test( 'returns CSV-034 when skill id is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { name: 'Test', description: 'Test skill', tags: [ 'test' ] } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-034: skills[0].id: Missing value' )
        } )


        test( 'returns CSV-035 when skill name is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { id: 'test', description: 'Test skill', tags: [ 'test' ] } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-035: skills[0].name: Missing value' )
        } )


        test( 'returns CSV-036 when skill description is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { id: 'test', name: 'Test', tags: [ 'test' ] } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-036: skills[0].description: Missing value' )
        } )


        test( 'returns CSV-037 when skill tags is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { id: 'test', name: 'Test', description: 'Test skill' } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-037: skills[0].tags: Missing value' )
        } )


        test( 'returns CSV-038 when skill tags is empty array', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { id: 'test', name: 'Test', description: 'Test skill', tags: [] } ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-038: skills[0].tags: Must be a non-empty array' )
        } )


        test( 'validates multiple skills with correct index', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [
                    { id: 'first', name: 'First', description: 'First skill', tags: [ 'ok' ] },
                    { id: 'second', description: 'Missing name', tags: [ 'ok' ] }
                ]
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-035: skills[1].name: Missing value' )
        } )
    } )


    describe( 'validate — provider validation', () => {

        test( 'returns CSV-040 when provider url is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                provider: { organization: 'Example Corp' }
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-040: provider.url: Missing value' )
        } )


        test( 'returns CSV-041 when provider organization is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                provider: { url: 'https://example.com' }
            }
            const { status, messages } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-041: provider.organization: Missing value' )
        } )


        test( 'skips provider validation when provider is not present', () => {
            const { status, messages } = CardStructureValidator.validate( { agentCard: MINIMAL_AGENT_CARD } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )
    } )
} )
