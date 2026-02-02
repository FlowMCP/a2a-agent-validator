import { CapabilityClassifier } from '../../../src/task/CapabilityClassifier.mjs'
import { VALID_AGENT_CARD, MINIMAL_AGENT_CARD, EXPECTED_CATEGORY_KEYS } from '../../helpers/config.mjs'


describe( 'CapabilityClassifier', () => {

    describe( 'classify — full agent card', () => {

        test( 'returns all 12 category keys', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )
            const keys = Object.keys( categories )

            expect( keys ).toEqual( EXPECTED_CATEGORY_KEYS )
        } )


        test( 'sets isReachable to true', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['isReachable'] ).toBe( true )
        } )


        test( 'sets hasAgentCard to true', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['hasAgentCard'] ).toBe( true )
        } )


        test( 'sets hasValidStructure to true', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['hasValidStructure'] ).toBe( true )
        } )


        test( 'sets hasSkills to true when skills present', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['hasSkills'] ).toBe( true )
        } )


        test( 'sets hasSecuritySchemes to true when security_schemes present', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['hasSecuritySchemes'] ).toBe( true )
        } )


        test( 'sets hasProvider to true when provider present', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['hasProvider'] ).toBe( true )
        } )


        test( 'sets supportsStreaming to true when streaming is true', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['supportsStreaming'] ).toBe( true )
        } )


        test( 'sets supportsPushNotifications to false when push_notifications is false', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['supportsPushNotifications'] ).toBe( false )
        } )


        test( 'sets supportsJsonRpc to true when JSONRPC interface present', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['supportsJsonRpc'] ).toBe( true )
        } )


        test( 'sets supportsGrpc to true when GRPC interface present', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['supportsGrpc'] ).toBe( true )
        } )


        test( 'sets supportsExtendedCard to true when extended_agent_card is true', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['supportsExtendedCard'] ).toBe( true )
        } )


        test( 'sets hasDocumentation to true when documentation_url present', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: VALID_AGENT_CARD } )

            expect( categories['hasDocumentation'] ).toBe( true )
        } )
    } )


    describe( 'classify — minimal agent card', () => {

        test( 'sets hasSecuritySchemes to false when no security_schemes', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD } )

            expect( categories['hasSecuritySchemes'] ).toBe( false )
        } )


        test( 'sets hasProvider to false when no provider', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD } )

            expect( categories['hasProvider'] ).toBe( false )
        } )


        test( 'sets supportsStreaming to false when not specified', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD } )

            expect( categories['supportsStreaming'] ).toBe( false )
        } )


        test( 'sets supportsGrpc to false when no GRPC interface', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD } )

            expect( categories['supportsGrpc'] ).toBe( false )
        } )


        test( 'sets supportsExtendedCard to false when not specified', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD } )

            expect( categories['supportsExtendedCard'] ).toBe( false )
        } )


        test( 'sets hasDocumentation to false when no documentation_url', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD } )

            expect( categories['hasDocumentation'] ).toBe( false )
        } )
    } )


    describe( 'classify — edge cases', () => {

        test( 'sets hasSkills to false when skills is empty array', () => {
            const card = { ...VALID_AGENT_CARD, skills: [] }
            const { categories } = CapabilityClassifier.classify( { agentCard: card } )

            expect( categories['hasSkills'] ).toBe( false )
        } )


        test( 'sets hasSecuritySchemes to false when security_schemes is empty object', () => {
            const card = { ...VALID_AGENT_CARD, security_schemes: {} }
            const { categories } = CapabilityClassifier.classify( { agentCard: card } )

            expect( categories['hasSecuritySchemes'] ).toBe( false )
        } )


        test( 'sets hasDocumentation to false when documentation_url is empty string', () => {
            const card = { ...VALID_AGENT_CARD, documentation_url: '' }
            const { categories } = CapabilityClassifier.classify( { agentCard: card } )

            expect( categories['hasDocumentation'] ).toBe( false )
        } )
    } )
} )
