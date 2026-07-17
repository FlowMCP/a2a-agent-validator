import { CardStructureValidator } from '../../../src/task/CardStructureValidator.mjs'
import { VALID_AGENT_CARD, MINIMAL_AGENT_CARD } from '../../helpers/config.mjs'


describe( 'CardStructureValidator', () => {

    describe( 'validate — valid cards', () => {

        test( 'returns status true for valid full agent card', () => {
            const { status, findings } = CardStructureValidator.validate( { agentCard: VALID_AGENT_CARD } )

            expect( status ).toBe( true )
            expect( findings ).toHaveLength( 0 )
        } )


        test( 'returns status true for minimal agent card', () => {
            const { status, findings } = CardStructureValidator.validate( { agentCard: MINIMAL_AGENT_CARD } )

            expect( status ).toBe( true )
            expect( findings ).toHaveLength( 0 )
        } )
    } )


    describe( 'validate — missing top-level fields', () => {

        test( 'returns CSV-020 when name is missing', () => {
            const { name, ...card } = VALID_AGENT_CARD
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-020', severity: 'warning', location: 'name', message: 'Missing required field "name"' } )
        } )


        test( 'returns CSV-021 when description is missing', () => {
            const { description, ...card } = VALID_AGENT_CARD
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-021', severity: 'warning', location: 'description', message: 'Missing required field "description"' } )
        } )


        test( 'returns CSV-022 when version is missing', () => {
            const { version, ...card } = VALID_AGENT_CARD
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-022', severity: 'warning', location: 'version', message: 'Missing required field "version"' } )
        } )


        test( 'returns CSV-023 when supported_interfaces is missing', () => {
            const { supported_interfaces, ...card } = VALID_AGENT_CARD
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-023', severity: 'warning', location: 'supported_interfaces', message: 'Missing required field "supported_interfaces"' } )
        } )


        test( 'returns CSV-025 when capabilities is missing', () => {
            const { capabilities, ...card } = VALID_AGENT_CARD
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-025', severity: 'warning', location: 'capabilities', message: 'Missing required field "capabilities"' } )
        } )


        test( 'returns CSV-026 when default_input_modes is missing', () => {
            const { default_input_modes, ...card } = VALID_AGENT_CARD
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-026', severity: 'warning', location: 'default_input_modes', message: 'Missing required field "default_input_modes"' } )
        } )


        test( 'returns CSV-027 when default_output_modes is missing', () => {
            const { default_output_modes, ...card } = VALID_AGENT_CARD
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-027', severity: 'warning', location: 'default_output_modes', message: 'Missing required field "default_output_modes"' } )
        } )


        test( 'returns CSV-028 when skills is missing', () => {
            const { skills, ...card } = VALID_AGENT_CARD
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-028', severity: 'warning', location: 'skills', message: 'Missing required field "skills"' } )
        } )


        test( 'collects multiple missing fields', () => {
            const { name, description, version, ...card } = VALID_AGENT_CARD
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toHaveLength( 3 )
        } )
    } )


    describe( 'validate — supported_interfaces validation', () => {

        test( 'returns CSV-024 when supported_interfaces is empty', () => {
            const card = { ...VALID_AGENT_CARD, supported_interfaces: [] }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-024', severity: 'warning', location: 'supported_interfaces', message: 'Must not be empty' } )
        } )


        test( 'returns CSV-030 when interface url is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { protocol_binding: 'JSONRPC', protocol_version: '0.3' } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-030', severity: 'warning', location: 'supported_interfaces[0].url', message: 'Missing value' } )
        } )


        test( 'returns CSV-031 when interface url is not HTTPS', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { url: 'http://agent.example.com/a2a', protocol_binding: 'JSONRPC', protocol_version: '0.3' } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-031', severity: 'warning', location: 'supported_interfaces[0].url', message: 'Must be a valid HTTPS URL' } )
        } )


        test( 'returns CSV-031 when interface url is not a valid URL', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { url: 'not-a-url', protocol_binding: 'JSONRPC', protocol_version: '0.3' } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-031', severity: 'warning', location: 'supported_interfaces[0].url', message: 'Must be a valid HTTPS URL' } )
        } )


        test( 'returns CSV-032 when protocol_binding is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { url: 'https://agent.example.com/a2a', protocol_version: '0.3' } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-032', severity: 'warning', location: 'supported_interfaces[0].protocol_binding', message: 'Missing value' } )
        } )


        test( 'returns CSV-033 when protocol_version is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [ { url: 'https://agent.example.com/a2a', protocol_binding: 'JSONRPC' } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-033', severity: 'warning', location: 'supported_interfaces[0].protocol_version', message: 'Missing value' } )
        } )


        test( 'validates multiple interfaces with correct index', () => {
            const card = {
                ...VALID_AGENT_CARD,
                supported_interfaces: [
                    { url: 'https://agent.example.com/a2a', protocol_binding: 'JSONRPC', protocol_version: '0.3' },
                    { protocol_binding: 'GRPC', protocol_version: '0.3' }
                ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-030', severity: 'warning', location: 'supported_interfaces[1].url', message: 'Missing value' } )
        } )
    } )


    describe( 'validate — skills validation', () => {

        test( 'returns CSV-034 when skill id is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { name: 'Test', description: 'Test skill', tags: [ 'test' ] } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-034', severity: 'warning', location: 'skills[0].id', message: 'Missing value' } )
        } )


        test( 'returns CSV-035 when skill name is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { id: 'test', description: 'Test skill', tags: [ 'test' ] } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-035', severity: 'warning', location: 'skills[0].name', message: 'Missing value' } )
        } )


        test( 'returns CSV-036 when skill description is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { id: 'test', name: 'Test', tags: [ 'test' ] } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-036', severity: 'warning', location: 'skills[0].description', message: 'Missing value' } )
        } )


        test( 'returns CSV-037 when skill tags is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { id: 'test', name: 'Test', description: 'Test skill' } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-037', severity: 'warning', location: 'skills[0].tags', message: 'Missing value' } )
        } )


        test( 'returns CSV-038 when skill tags is empty array', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [ { id: 'test', name: 'Test', description: 'Test skill', tags: [] } ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-038', severity: 'warning', location: 'skills[0].tags', message: 'Must be a non-empty array' } )
        } )


        test( 'validates multiple skills with correct index', () => {
            const card = {
                ...VALID_AGENT_CARD,
                skills: [
                    { id: 'first', name: 'First', description: 'First skill', tags: [ 'ok' ] },
                    { id: 'second', description: 'Missing name', tags: [ 'ok' ] }
                ]
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-035', severity: 'warning', location: 'skills[1].name', message: 'Missing value' } )
        } )
    } )


    describe( 'validate — provider validation', () => {

        test( 'returns CSV-040 when provider url is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                provider: { organization: 'Example Corp' }
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-040', severity: 'warning', location: 'provider.url', message: 'Missing value' } )
        } )


        test( 'returns CSV-041 when provider organization is missing', () => {
            const card = {
                ...VALID_AGENT_CARD,
                provider: { url: 'https://example.com' }
            }
            const { status, findings } = CardStructureValidator.validate( { agentCard: card } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-041', severity: 'warning', location: 'provider.organization', message: 'Missing value' } )
        } )


        test( 'skips provider validation when provider is not present', () => {
            const { status, findings } = CardStructureValidator.validate( { agentCard: MINIMAL_AGENT_CARD } )

            expect( status ).toBe( true )
            expect( findings ).toHaveLength( 0 )
        } )
    } )
} )
