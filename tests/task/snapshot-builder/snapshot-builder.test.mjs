import { SnapshotBuilder } from '../../../src/task/SnapshotBuilder.mjs'
import { TEST_ENDPOINT, VALID_AGENT_CARD, AGENT_CARD_WITH_AP2_EXTENSION, AGENT_CARD_WITH_X402_EXTENSION, AGENT_CARD_WITH_DUAL_EXTENSIONS, AGENT_CARD_WITH_ERC8004_SERVICE, MOCK_EXTENSIONS_HEADER, MOCK_AP2_HEADER_URI, MOCK_X402_HEADER_URI, FULL_CATEGORIES, EMPTY_CATEGORIES, EXPECTED_ENTRY_KEYS, EXPECTED_CATEGORY_KEYS } from '../../helpers/config.mjs'


describe( 'SnapshotBuilder', () => {

    describe( 'build', () => {

        test( 'returns all 18 entry keys', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )
            const keys = Object.keys( entries )

            expect( keys ).toEqual( EXPECTED_ENTRY_KEYS )
        } )


        test( 'sets url to the endpoint', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['url'] ).toBe( TEST_ENDPOINT )
        } )


        test( 'extracts agentName from card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['agentName'] ).toBe( 'Recipe Agent' )
        } )


        test( 'extracts agentDescription from card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['agentDescription'] ).toBe( 'Agent that helps users with recipes and cooking.' )
        } )


        test( 'extracts agentVersion from card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['agentVersion'] ).toBe( '1.0.0' )
        } )


        test( 'extracts providerOrganization from card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['providerOrganization'] ).toBe( 'Example Corp' )
        } )


        test( 'extracts providerUrl from card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['providerUrl'] ).toBe( 'https://example.com' )
        } )


        test( 'sets providerOrganization to null when no provider', () => {
            const { provider, ...cardWithoutProvider } = VALID_AGENT_CARD
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: cardWithoutProvider, categories: FULL_CATEGORIES } )

            expect( entries['providerOrganization'] ).toBeNull()
        } )


        test( 'sets providerUrl to null when no provider', () => {
            const { provider, ...cardWithoutProvider } = VALID_AGENT_CARD
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: cardWithoutProvider, categories: FULL_CATEGORIES } )

            expect( entries['providerUrl'] ).toBeNull()
        } )


        test( 'extracts skillCount from card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['skillCount'] ).toBe( 2 )
        } )


        test( 'extracts skills as id/name pairs', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['skills'] ).toEqual( [
                { id: 'find-recipe', name: 'Find Recipe' },
                { id: 'nutrition-info', name: 'Nutrition Info' }
            ] )
        } )


        test( 'extracts protocolBindings from interfaces', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['protocolBindings'] ).toEqual( [ 'JSONRPC', 'GRPC' ] )
        } )


        test( 'extracts protocolVersion from first interface', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['protocolVersion'] ).toBe( '0.3' )
        } )


        test( 'extracts defaultInputModes from card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['defaultInputModes'] ).toEqual( [ 'text/plain', 'application/json' ] )
        } )


        test( 'extracts defaultOutputModes from card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['defaultOutputModes'] ).toEqual( [ 'text/plain', 'application/json' ] )
        } )


        test( 'includes ISO 8601 timestamp', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['timestamp'] ).toMatch( /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/ )
        } )


        test( 'passes through categories unchanged', () => {
            const { categories } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( categories ).toEqual( FULL_CATEGORIES )
        } )


        test( 'returns empty protocolBindings when supported_interfaces is missing', () => {
            const { supported_interfaces, ...cardWithout } = VALID_AGENT_CARD
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: cardWithout, categories: FULL_CATEGORIES } )

            expect( entries['protocolBindings'] ).toEqual( [] )
            expect( entries['protocolVersion'] ).toBeNull()
        } )


        test( 'returns empty skills when skills is missing', () => {
            const { skills, ...cardWithout } = VALID_AGENT_CARD
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: cardWithout, categories: FULL_CATEGORIES } )

            expect( entries['skills'] ).toEqual( [] )
            expect( entries['skillCount'] ).toBe( 0 )
        } )
    } )


    describe( 'buildEmpty', () => {

        test( 'returns all 16 category keys', () => {
            const { categories } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )
            const keys = Object.keys( categories )

            expect( keys ).toEqual( EXPECTED_CATEGORY_KEYS )
        } )


        test( 'returns all 18 entry keys', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )
            const keys = Object.keys( entries )

            expect( keys ).toEqual( EXPECTED_ENTRY_KEYS )
        } )


        test( 'sets all categories to false', () => {
            const { categories } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( categories ).toEqual( EMPTY_CATEGORIES )
        } )


        test( 'sets url to the endpoint', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries['url'] ).toBe( TEST_ENDPOINT )
        } )


        test( 'sets all data entries to null', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries['agentName'] ).toBeNull()
            expect( entries['agentDescription'] ).toBeNull()
            expect( entries['agentVersion'] ).toBeNull()
            expect( entries['providerOrganization'] ).toBeNull()
            expect( entries['providerUrl'] ).toBeNull()
            expect( entries['skillCount'] ).toBeNull()
            expect( entries['skills'] ).toBeNull()
            expect( entries['protocolBindings'] ).toBeNull()
            expect( entries['protocolVersion'] ).toBeNull()
            expect( entries['defaultInputModes'] ).toBeNull()
            expect( entries['defaultOutputModes'] ).toBeNull()
            expect( entries['ap2Version'] ).toBeNull()
            expect( entries['ap2Roles'] ).toBeNull()
            expect( entries['x402Version'] ).toBeNull()
            expect( entries['erc8004ServiceUrl'] ).toBeNull()
            expect( entries['extensions'] ).toBeNull()
        } )


        test( 'includes ISO 8601 timestamp', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries['timestamp'] ).toMatch( /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/ )
        } )
    } )


    describe( 'build — AP2 and ERC-8004 entries', () => {

        test( 'extracts ap2Version from card extensions URI', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: AGENT_CARD_WITH_AP2_EXTENSION, categories: FULL_CATEGORIES } )

            expect( entries['ap2Version'] ).toBe( '1.0' )
        } )


        test( 'extracts ap2Version from extensions header as fallback', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES, extensions: MOCK_EXTENSIONS_HEADER } )

            expect( entries['ap2Version'] ).toBe( '1.0' )
        } )


        test( 'sets ap2Version to null when no extensions', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['ap2Version'] ).toBeNull()
        } )


        test( 'extracts erc8004ServiceUrl from services array', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: AGENT_CARD_WITH_ERC8004_SERVICE, categories: FULL_CATEGORIES } )

            expect( entries['erc8004ServiceUrl'] ).toBe( 'https://registry.example.com/erc8004' )
        } )


        test( 'sets erc8004ServiceUrl to null when no matching service', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['erc8004ServiceUrl'] ).toBeNull()
        } )


        test( 'stores raw extensions header value', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES, extensions: MOCK_EXTENSIONS_HEADER } )

            expect( entries['extensions'] ).toBe( MOCK_EXTENSIONS_HEADER )
        } )


        test( 'sets extensions to null when not provided', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['extensions'] ).toBeNull()
        } )
    } )


    describe( 'build — AP2 roles extraction', () => {

        test( 'extracts ap2Roles from dual extension card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: AGENT_CARD_WITH_DUAL_EXTENSIONS, categories: FULL_CATEGORIES } )

            expect( entries['ap2Roles'] ).toEqual( [ 'merchant' ] )
        } )


        test( 'sets ap2Roles to null when AP2 extension has no params', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: AGENT_CARD_WITH_AP2_EXTENSION, categories: FULL_CATEGORIES } )

            expect( entries['ap2Roles'] ).toBeNull()
        } )


        test( 'sets ap2Roles to null when no AP2 extension', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['ap2Roles'] ).toBeNull()
        } )
    } )


    describe( 'build — x402 version extraction', () => {

        test( 'extracts x402Version from card extensions URI', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: AGENT_CARD_WITH_X402_EXTENSION, categories: FULL_CATEGORIES } )

            expect( entries['x402Version'] ).toBe( '0.1' )
        } )


        test( 'extracts x402Version from extensions header as fallback', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES, extensions: MOCK_X402_HEADER_URI } )

            expect( entries['x402Version'] ).toBe( '0.1' )
        } )


        test( 'sets x402Version to null when no x402 extension', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: VALID_AGENT_CARD, categories: FULL_CATEGORIES } )

            expect( entries['x402Version'] ).toBeNull()
        } )


        test( 'extracts both ap2Version and x402Version from dual extension card', () => {
            const { entries } = SnapshotBuilder.build( { endpoint: TEST_ENDPOINT, agentCard: AGENT_CARD_WITH_DUAL_EXTENSIONS, categories: FULL_CATEGORIES } )

            expect( entries['ap2Version'] ).toBe( '0.1' )
            expect( entries['x402Version'] ).toBe( '0.1' )
        } )
    } )
} )
