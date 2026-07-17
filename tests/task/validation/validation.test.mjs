import { Validation } from '../../../src/task/Validation.mjs'
import { TEST_ENDPOINT } from '../../helpers/config.mjs'


describe( 'Validation', () => {

    describe( 'validationValidate', () => {

        test( 'returns VAL-101 when endpoint is missing', () => {
            const { status, findings } = Validation.validationValidate( {} )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-101', severity: 'error', location: 'endpoint', message: 'Missing value' } )
        } )


        test( 'returns VAL-102 when endpoint is not a string', () => {
            const { status, findings } = Validation.validationValidate( { endpoint: 123 } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-102', severity: 'error', location: 'endpoint', message: 'Must be a string' } )
        } )


        test( 'returns VAL-103 when endpoint is empty', () => {
            const { status, findings } = Validation.validationValidate( { endpoint: '   ' } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-103', severity: 'error', location: 'endpoint', message: 'Must not be empty' } )
        } )


        test( 'returns VAL-104 when endpoint is not a valid URL', () => {
            const { status, findings } = Validation.validationValidate( { endpoint: 'not-a-url' } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-104', severity: 'error', location: 'endpoint', message: 'Must be a valid URL' } )
        } )


        test( 'returns status true for valid endpoint', () => {
            const { status, findings } = Validation.validationValidate( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( true )
            expect( findings ).toHaveLength( 0 )
        } )
    } )


    describe( 'validationStart', () => {

        test( 'returns VAL-101 when endpoint is missing', () => {
            const { status, findings } = Validation.validationStart( {} )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-101', severity: 'error', location: 'endpoint', message: 'Missing value' } )
        } )


        test( 'returns VAL-102 when endpoint is not a string', () => {
            const { status, findings } = Validation.validationStart( { endpoint: 42 } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-102', severity: 'error', location: 'endpoint', message: 'Must be a string' } )
        } )


        test( 'returns VAL-103 when endpoint is empty', () => {
            const { status, findings } = Validation.validationStart( { endpoint: '' } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-103', severity: 'error', location: 'endpoint', message: 'Must not be empty' } )
        } )


        test( 'returns VAL-104 when endpoint is not a valid URL', () => {
            const { status, findings } = Validation.validationStart( { endpoint: 'foobar' } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-104', severity: 'error', location: 'endpoint', message: 'Must be a valid URL' } )
        } )


        test( 'returns VAL-105 when timeout is not a number', () => {
            const { status, findings } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: 'fast' } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-105', severity: 'error', location: 'timeout', message: 'Must be a number' } )
        } )


        test( 'returns VAL-106 when timeout is zero', () => {
            const { status, findings } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: 0 } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-106', severity: 'error', location: 'timeout', message: 'Must be greater than 0' } )
        } )


        test( 'returns VAL-106 when timeout is negative', () => {
            const { status, findings } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: -1000 } )

            expect( status ).toBe( false )
            expect( findings ).toContainEqual( { code: 'VAL-106', severity: 'error', location: 'timeout', message: 'Must be greater than 0' } )
        } )


        test( 'returns status true for valid endpoint without timeout', () => {
            const { status, findings } = Validation.validationStart( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( true )
            expect( findings ).toHaveLength( 0 )
        } )


        test( 'returns status true for valid endpoint with timeout', () => {
            const { status, findings } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: 5000 } )

            expect( status ).toBe( true )
            expect( findings ).toHaveLength( 0 )
        } )
    } )


    describe( 'validationCompare', () => {

        const VALID_SNAPSHOT = {
            categories: { isReachable: true },
            entries: { url: TEST_ENDPOINT }
        }


        test( 'returns VAL-107 when before is missing', () => {
            const { status, findings } = Validation.validationCompare( { after: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( findings[0]['code'] ).toBe( 'VAL-107' )
            expect( findings[0]['severity'] ).toBe( 'error' )
        } )


        test( 'returns VAL-107 when before is null', () => {
            const { status, findings } = Validation.validationCompare( { before: null, after: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( findings[0]['code'] ).toBe( 'VAL-107' )
        } )


        test( 'returns VAL-107 when before is an array', () => {
            const { status, findings } = Validation.validationCompare( { before: [], after: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( findings[0]['code'] ).toBe( 'VAL-107' )
        } )


        test( 'returns VAL-107 when before is missing categories', () => {
            const { status, findings } = Validation.validationCompare( { before: { entries: {} }, after: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( findings[0]['code'] ).toBe( 'VAL-107' )
        } )


        test( 'returns VAL-108 when after is missing', () => {
            const { status, findings } = Validation.validationCompare( { before: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( findings[0]['code'] ).toBe( 'VAL-108' )
        } )


        test( 'returns VAL-108 when after is null', () => {
            const { status, findings } = Validation.validationCompare( { before: VALID_SNAPSHOT, after: null } )

            expect( status ).toBe( false )
            expect( findings[0]['code'] ).toBe( 'VAL-108' )
        } )


        test( 'returns VAL-108 when after is missing entries', () => {
            const { status, findings } = Validation.validationCompare( { before: VALID_SNAPSHOT, after: { categories: {} } } )

            expect( status ).toBe( false )
            expect( findings[0]['code'] ).toBe( 'VAL-108' )
        } )


        test( 'returns status true for valid snapshots', () => {
            const { status, findings } = Validation.validationCompare( { before: VALID_SNAPSHOT, after: VALID_SNAPSHOT } )

            expect( status ).toBe( true )
            expect( findings ).toHaveLength( 0 )
        } )
    } )


    describe( 'error', () => {

        test( 'throws an Error with joined finding codes', () => {
            const findings = [
                { code: 'VAL-101', severity: 'error', location: 'endpoint', message: 'Missing value' },
                { code: 'VAL-105', severity: 'error', location: 'timeout', message: 'Must be a number' }
            ]

            expect( () => Validation.error( { findings } ) ).toThrow( 'VAL-101 endpoint: Missing value, VAL-105 timeout: Must be a number' )
        } )


        test( 'throws an Error with single finding', () => {
            const findings = [ { code: 'VAL-101', severity: 'error', location: 'endpoint', message: 'Missing value' } ]

            expect( () => Validation.error( { findings } ) ).toThrow( 'VAL-101 endpoint: Missing value' )
        } )
    } )
} )
