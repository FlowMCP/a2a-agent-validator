import { Validation } from '../../../src/task/Validation.mjs'
import { TEST_ENDPOINT } from '../../helpers/config.mjs'


describe( 'Validation', () => {

    describe( 'validationValidate', () => {

        test( 'returns VAL-001 when endpoint is missing', () => {
            const { status, messages } = Validation.validationValidate( {} )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-001 endpoint: Missing value' )
        } )


        test( 'returns VAL-002 when endpoint is not a string', () => {
            const { status, messages } = Validation.validationValidate( { endpoint: 123 } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-002 endpoint: Must be a string' )
        } )


        test( 'returns VAL-003 when endpoint is empty', () => {
            const { status, messages } = Validation.validationValidate( { endpoint: '   ' } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-003 endpoint: Must not be empty' )
        } )


        test( 'returns VAL-004 when endpoint is not a valid URL', () => {
            const { status, messages } = Validation.validationValidate( { endpoint: 'not-a-url' } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-004 endpoint: Must be a valid URL' )
        } )


        test( 'returns status true for valid endpoint', () => {
            const { status, messages } = Validation.validationValidate( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )
    } )


    describe( 'validationStart', () => {

        test( 'returns VAL-001 when endpoint is missing', () => {
            const { status, messages } = Validation.validationStart( {} )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-001 endpoint: Missing value' )
        } )


        test( 'returns VAL-002 when endpoint is not a string', () => {
            const { status, messages } = Validation.validationStart( { endpoint: 42 } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-002 endpoint: Must be a string' )
        } )


        test( 'returns VAL-003 when endpoint is empty', () => {
            const { status, messages } = Validation.validationStart( { endpoint: '' } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-003 endpoint: Must not be empty' )
        } )


        test( 'returns VAL-004 when endpoint is not a valid URL', () => {
            const { status, messages } = Validation.validationStart( { endpoint: 'foobar' } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-004 endpoint: Must be a valid URL' )
        } )


        test( 'returns VAL-005 when timeout is not a number', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: 'fast' } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-005 timeout: Must be a number' )
        } )


        test( 'returns VAL-006 when timeout is zero', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: 0 } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-006 timeout: Must be greater than 0' )
        } )


        test( 'returns VAL-006 when timeout is negative', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: -1000 } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'VAL-006 timeout: Must be greater than 0' )
        } )


        test( 'returns status true for valid endpoint without timeout', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )


        test( 'returns status true for valid endpoint with timeout', () => {
            const { status, messages } = Validation.validationStart( { endpoint: TEST_ENDPOINT, timeout: 5000 } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )
    } )


    describe( 'validationCompare', () => {

        const VALID_SNAPSHOT = {
            categories: { isReachable: true },
            entries: { url: TEST_ENDPOINT }
        }


        test( 'returns VAL-007 when before is missing', () => {
            const { status, messages } = Validation.validationCompare( { after: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( messages[0] ).toMatch( /VAL-007/ )
        } )


        test( 'returns VAL-007 when before is null', () => {
            const { status, messages } = Validation.validationCompare( { before: null, after: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( messages[0] ).toMatch( /VAL-007/ )
        } )


        test( 'returns VAL-007 when before is an array', () => {
            const { status, messages } = Validation.validationCompare( { before: [], after: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( messages[0] ).toMatch( /VAL-007/ )
        } )


        test( 'returns VAL-007 when before is missing categories', () => {
            const { status, messages } = Validation.validationCompare( { before: { entries: {} }, after: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( messages[0] ).toMatch( /VAL-007/ )
        } )


        test( 'returns VAL-008 when after is missing', () => {
            const { status, messages } = Validation.validationCompare( { before: VALID_SNAPSHOT } )

            expect( status ).toBe( false )
            expect( messages[0] ).toMatch( /VAL-008/ )
        } )


        test( 'returns VAL-008 when after is null', () => {
            const { status, messages } = Validation.validationCompare( { before: VALID_SNAPSHOT, after: null } )

            expect( status ).toBe( false )
            expect( messages[0] ).toMatch( /VAL-008/ )
        } )


        test( 'returns VAL-008 when after is missing entries', () => {
            const { status, messages } = Validation.validationCompare( { before: VALID_SNAPSHOT, after: { categories: {} } } )

            expect( status ).toBe( false )
            expect( messages[0] ).toMatch( /VAL-008/ )
        } )


        test( 'returns status true for valid snapshots', () => {
            const { status, messages } = Validation.validationCompare( { before: VALID_SNAPSHOT, after: VALID_SNAPSHOT } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
        } )
    } )


    describe( 'error', () => {

        test( 'throws an Error with joined messages', () => {
            const messages = [ 'VAL-001 endpoint: Missing value', 'VAL-005 timeout: Must be a number' ]

            expect( () => Validation.error( { messages } ) ).toThrow( 'VAL-001 endpoint: Missing value, VAL-005 timeout: Must be a number' )
        } )


        test( 'throws an Error with single message', () => {
            const messages = [ 'VAL-001 endpoint: Missing value' ]

            expect( () => Validation.error( { messages } ) ).toThrow( 'VAL-001 endpoint: Missing value' )
        } )
    } )
} )
