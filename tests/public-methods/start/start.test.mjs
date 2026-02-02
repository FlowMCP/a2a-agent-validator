import { jest } from '@jest/globals'

import { A2aAgentValidator } from '../../../src/A2aAgentValidator.mjs'
import { TEST_ENDPOINT, VALID_AGENT_CARD, MINIMAL_AGENT_CARD, EXPECTED_CATEGORY_KEYS, EXPECTED_ENTRY_KEYS, EMPTY_CATEGORIES } from '../../helpers/config.mjs'


describe( 'A2aAgentValidator.start', () => {

    let originalFetch


    beforeEach( () => {
        originalFetch = globalThis.fetch
    } )


    afterEach( () => {
        globalThis.fetch = originalFetch
    } )


    describe( 'parameter validation', () => {

        test( 'throws when endpoint is missing', async () => {
            await expect( A2aAgentValidator.start( {} ) ).rejects.toThrow( /VAL-001/ )
        } )


        test( 'throws when endpoint is not a string', async () => {
            await expect( A2aAgentValidator.start( { endpoint: 42 } ) ).rejects.toThrow( /VAL-002/ )
        } )


        test( 'throws when endpoint is empty', async () => {
            await expect( A2aAgentValidator.start( { endpoint: '' } ) ).rejects.toThrow( /VAL-003/ )
        } )


        test( 'throws when endpoint is not a valid URL', async () => {
            await expect( A2aAgentValidator.start( { endpoint: 'invalid' } ) ).rejects.toThrow( /VAL-004/ )
        } )


        test( 'throws when timeout is not a number', async () => {
            await expect( A2aAgentValidator.start( { endpoint: TEST_ENDPOINT, timeout: 'fast' } ) ).rejects.toThrow( /VAL-005/ )
        } )


        test( 'throws when timeout is zero', async () => {
            await expect( A2aAgentValidator.start( { endpoint: TEST_ENDPOINT, timeout: 0 } ) ).rejects.toThrow( /VAL-006/ )
        } )
    } )


    describe( 'unreachable server', () => {

        test( 'returns empty snapshot when server not reachable', async () => {
            globalThis.fetch = jest.fn().mockRejectedValue( new Error( 'fetch failed' ) )

            const { status, messages, categories, entries } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CON-010: Server not reachable' )
            expect( categories ).toEqual( EMPTY_CATEGORIES )
            expect( entries['url'] ).toBe( TEST_ENDPOINT )
            expect( entries['agentName'] ).toBeNull()
        } )


        test( 'returns all category and entry keys even when unreachable', async () => {
            globalThis.fetch = jest.fn().mockRejectedValue( new Error( 'fetch failed' ) )

            const { categories, entries } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )
            const categoryKeys = Object.keys( categories )
            const entryKeys = Object.keys( entries )

            expect( categoryKeys ).toEqual( EXPECTED_CATEGORY_KEYS )
            expect( entryKeys ).toEqual( EXPECTED_ENTRY_KEYS )
        } )
    } )


    describe( 'successful pipeline', () => {

        test( 'returns all 12 category keys', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { categories } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )
            const keys = Object.keys( categories )

            expect( keys ).toEqual( EXPECTED_CATEGORY_KEYS )
        } )


        test( 'returns all 13 entry keys', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { entries } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )
            const keys = Object.keys( entries )

            expect( keys ).toEqual( EXPECTED_ENTRY_KEYS )
        } )


        test( 'sets isReachable and hasAgentCard to true', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { categories } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )

            expect( categories['isReachable'] ).toBe( true )
            expect( categories['hasAgentCard'] ).toBe( true )
        } )


        test( 'classifies capabilities correctly for full card', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { categories } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )

            expect( categories['hasSkills'] ).toBe( true )
            expect( categories['hasSecuritySchemes'] ).toBe( true )
            expect( categories['hasProvider'] ).toBe( true )
            expect( categories['supportsStreaming'] ).toBe( true )
            expect( categories['supportsJsonRpc'] ).toBe( true )
            expect( categories['supportsGrpc'] ).toBe( true )
            expect( categories['supportsExtendedCard'] ).toBe( true )
            expect( categories['hasDocumentation'] ).toBe( true )
        } )


        test( 'extracts agent info into entries', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { entries } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )

            expect( entries['url'] ).toBe( TEST_ENDPOINT )
            expect( entries['agentName'] ).toBe( 'Recipe Agent' )
            expect( entries['agentVersion'] ).toBe( '1.0.0' )
            expect( entries['skillCount'] ).toBe( 2 )
        } )


        test( 'includes timestamp in entries', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { entries } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )

            expect( entries['timestamp'] ).toMatch( /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/ )
        } )


        test( 'returns status true for valid card', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( VALID_AGENT_CARD )
            } )

            const { status, messages } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )


        test( 'returns status false with structure errors for invalid card', async () => {
            const { name, ...invalidCard } = VALID_AGENT_CARD

            globalThis.fetch = jest.fn().mockResolvedValue( {
                ok: true,
                status: 200,
                text: async () => JSON.stringify( invalidCard )
            } )

            const { status, messages, categories } = await A2aAgentValidator.start( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'CSV-020: Missing required field "name"' )
            expect( categories['isReachable'] ).toBe( true )
            expect( categories['hasAgentCard'] ).toBe( true )
        } )
    } )
} )
