import { SnapshotBuilder } from '../../../src/task/SnapshotBuilder.mjs'
import { TEST_ENDPOINT, VALID_AGENT_CARD, FULL_CATEGORIES, EMPTY_CATEGORIES, EXPECTED_ENTRY_KEYS, EXPECTED_CATEGORY_KEYS } from '../../helpers/config.mjs'


describe( 'SnapshotBuilder', () => {

    describe( 'build', () => {

        test( 'returns all 13 entry keys', () => {
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
    } )


    describe( 'buildEmpty', () => {

        test( 'returns all 12 category keys', () => {
            const { categories } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )
            const keys = Object.keys( categories )

            expect( keys ).toEqual( EXPECTED_CATEGORY_KEYS )
        } )


        test( 'returns all 13 entry keys', () => {
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
        } )


        test( 'includes ISO 8601 timestamp', () => {
            const { entries } = SnapshotBuilder.buildEmpty( { endpoint: TEST_ENDPOINT } )

            expect( entries['timestamp'] ).toMatch( /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/ )
        } )
    } )
} )
