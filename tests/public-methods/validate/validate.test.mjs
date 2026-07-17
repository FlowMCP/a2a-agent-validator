import { jest } from '@jest/globals'

import { A2aAgentValidator } from '../../../src/A2aAgentValidator.mjs'
import { TEST_ENDPOINT, VALID_AGENT_CARD, MINIMAL_AGENT_CARD } from '../../helpers/config.mjs'


describe( 'A2aAgentValidator.validate', () => {

    let originalFetch


    beforeEach( () => {
        originalFetch = globalThis.fetch
    } )


    afterEach( () => {
        globalThis.fetch = originalFetch
    } )


    describe( 'parameter validation', () => {

        test( 'throws when endpoint is missing', async () => {
            await expect( A2aAgentValidator.validate( {} ) ).rejects.toThrow( /VAL-101/ )
        } )


        test( 'throws when endpoint is not a string', async () => {
            await expect( A2aAgentValidator.validate( { endpoint: 42 } ) ).rejects.toThrow( /VAL-102/ )
        } )


        test( 'throws when endpoint is empty', async () => {
            await expect( A2aAgentValidator.validate( { endpoint: '' } ) ).rejects.toThrow( /VAL-103/ )
        } )


        test( 'throws when endpoint is not a valid URL', async () => {
            await expect( A2aAgentValidator.validate( { endpoint: 'invalid' } ) ).rejects.toThrow( /VAL-104/ )
        } )
    } )


    describe( 'unreachable server', () => {

        test( 'returns status false with CON-110 when server not reachable', async () => {
            globalThis.fetch = jest.fn().mockRejectedValue( new Error( 'fetch failed' ) )

            const { status, findings } = await A2aAgentValidator.validate( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CON-110', severity: 'info', location: null, message: 'Server not reachable' } )
        } )


        test( 'returns status false with CON-111 when agent card not found', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: false,
                status: 404,
                text: async () => 'Not Found'
            } )

            const { status, findings } = await A2aAgentValidator.validate( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CON-111', severity: 'info', location: null, message: 'Agent Card not found (HTTP 404)' } )
        } )
    } )


    describe( 'successful validation', () => {

        test( 'returns status true for valid full agent card', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { status, findings } = await A2aAgentValidator.validate( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( true )
            expect( findings ).toHaveLength( 0 )
        } )


        test( 'returns status true for minimal agent card', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( MINIMAL_AGENT_CARD )
            } )

            const { status, findings } = await A2aAgentValidator.validate( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( true )
            expect( findings ).toHaveLength( 0 )
        } )


        test( 'returns status false with structure errors for invalid card', async () => {
            const { name, ...invalidCard } = VALID_AGENT_CARD

            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( invalidCard )
            } )

            const { status, findings } = await A2aAgentValidator.validate( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'CSV-020', severity: 'warning', location: 'name', message: 'Missing required field "name"' } )
        } )


        test( 'returns only status and findings (no categories or entries)', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const result = await A2aAgentValidator.validate( { endpoint: TEST_ENDPOINT } )
            const keys = Object.keys( result )

            expect( keys ).toEqual( [ 'status', 'findings' ] )
        } )
    } )
} )
