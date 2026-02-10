import { jest } from '@jest/globals'

import { A2aConnector } from '../../../src/task/A2aConnector.mjs'
import { TEST_ENDPOINT, VALID_AGENT_CARD, MOCK_EXTENSIONS_HEADER } from '../../helpers/config.mjs'


const EXPECTED_URL = `${TEST_ENDPOINT}/.well-known/agent-card.json`
const TIMEOUT = 10000

const mockHeaders = ( { extensionsValue = null } = {} ) => ( {
    get: ( name ) => {
        if( name.toLowerCase() === 'a2a-extensions' ) {
            return extensionsValue
        }

        return null
    }
} )


describe( 'A2aConnector', () => {

    let originalFetch


    beforeEach( () => {
        originalFetch = globalThis.fetch
    } )


    afterEach( () => {
        globalThis.fetch = originalFetch
    } )


    describe( 'fetch', () => {

        test( 'returns agent card on successful response', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                headers: mockHeaders(),
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { status, messages, agentCard } = await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
            expect( agentCard['name'] ).toBe( 'Recipe Agent' )
        } )


        test( 'calls correct well-known URL', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                headers: mockHeaders(),
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            const calledUrl = globalThis.fetch.mock.calls[0][0]

            expect( calledUrl ).toBe( EXPECTED_URL )
        } )


        test( 'normalizes trailing slash on endpoint', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                headers: mockHeaders(),
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            await A2aConnector.fetch( { endpoint: `${TEST_ENDPOINT}/`, timeout: TIMEOUT } )

            const calledUrl = globalThis.fetch.mock.calls[0][0]

            expect( calledUrl ).toBe( EXPECTED_URL )
        } )


        test( 'returns CON-011 on HTTP 404', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: false,
                status: 404,
                headers: mockHeaders(),
                text: async () => 'Not Found'
            } )

            const { status, messages, agentCard } = await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CON-011: Agent Card not found (HTTP 404)' )
            expect( agentCard ).toBeNull()
        } )


        test( 'returns CON-012 on other HTTP errors', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: false,
                status: 500,
                headers: mockHeaders(),
                text: async () => 'Internal Server Error'
            } )

            const { status, messages } = await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CON-012: HTTP error (500)' )
        } )


        test( 'returns CON-013 when response is not valid JSON', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                headers: mockHeaders(),
                text: async () => '<html>Not JSON</html>'
            } )

            const { status, messages, agentCard } = await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CON-013: Response is not valid JSON' )
            expect( agentCard ).toBeNull()
        } )


        test( 'returns CON-014 on timeout', async () => {
            globalThis.fetch = jest.fn().mockImplementation( () => {
                const error = new Error( 'The operation was aborted' )
                error.name = 'AbortError'

                throw error
            } )

            const { status, messages } = await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CON-014: Request timeout exceeded' )
        } )


        test( 'returns CON-010 on network error', async () => {
            globalThis.fetch = jest.fn().mockRejectedValue( new Error( 'fetch failed' ) )

            const { status, messages } = await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CON-010: Server not reachable' )
        } )


        test( 'sends Accept application/json header', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                headers: mockHeaders(),
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            const options = globalThis.fetch.mock.calls[0][1]

            expect( options['headers']['Accept'] ).toBe( 'application/json' )
        } )


        test( 'captures A2A-Extensions header when present', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                headers: mockHeaders( { extensionsValue: MOCK_EXTENSIONS_HEADER } ),
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { extensions } = await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            expect( extensions ).toBe( MOCK_EXTENSIONS_HEADER )
        } )


        test( 'returns extensions as null when header is absent', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                headers: mockHeaders(),
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { extensions } = await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            expect( extensions ).toBeNull()
        } )


        test( 'returns extensions as null on network error', async () => {
            globalThis.fetch = jest.fn().mockRejectedValue( new Error( 'fetch failed' ) )

            const { extensions } = await A2aConnector.fetch( { endpoint: TEST_ENDPOINT, timeout: TIMEOUT } )

            expect( extensions ).toBeNull()
        } )
    } )
} )
