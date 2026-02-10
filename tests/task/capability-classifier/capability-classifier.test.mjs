import { CapabilityClassifier } from '../../../src/task/CapabilityClassifier.mjs'
import { VALID_AGENT_CARD, MINIMAL_AGENT_CARD, AGENT_CARD_WITH_AP2_EXTENSION, AGENT_CARD_WITH_X402_EXTENSION, AGENT_CARD_WITH_DUAL_EXTENSIONS, AGENT_CARD_WITH_ERC8004_SERVICE, MOCK_EXTENSIONS_HEADER, MOCK_X402_HEADER_URI, MOCK_DUAL_HEADER_URI, EXPECTED_CATEGORY_KEYS } from '../../helpers/config.mjs'


describe( 'CapabilityClassifier', () => {

    describe( 'classify — full agent card', () => {

        test( 'returns all 16 category keys', () => {
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


        test( 'handles missing supported_interfaces without crash', () => {
            const { supported_interfaces, ...cardWithout } = VALID_AGENT_CARD
            const { categories } = CapabilityClassifier.classify( { agentCard: cardWithout } )

            expect( categories['supportsJsonRpc'] ).toBe( false )
            expect( categories['supportsGrpc'] ).toBe( false )
        } )
    } )


    describe( 'classify — AP2 detection', () => {

        test( 'detects AP2 from extensions header', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD, extensions: MOCK_EXTENSIONS_HEADER } )

            expect( categories['supportsAp2'] ).toBe( true )
        } )


        test( 'does not detect AP2 when extensions header is null', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD, extensions: null } )

            expect( categories['supportsAp2'] ).toBe( false )
        } )


        test( 'detects AP2 from agentCard capabilities extensions field', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: AGENT_CARD_WITH_AP2_EXTENSION } )

            expect( categories['supportsAp2'] ).toBe( true )
        } )


        test( 'does not detect AP2 when extensions have unrelated URIs', () => {
            const card = {
                ...MINIMAL_AGENT_CARD,
                capabilities: {
                    extensions: [
                        { uri: 'urn:example:unrelated:v1', description: 'Unrelated', required: false }
                    ]
                }
            }
            const { categories } = CapabilityClassifier.classify( { agentCard: card } )

            expect( categories['supportsAp2'] ).toBe( false )
        } )


        test( 'detects AP2 case-insensitively from header', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD, extensions: 'AP2=https://example.com/AP2/v2.0' } )

            expect( categories['supportsAp2'] ).toBe( true )
        } )
    } )


    describe( 'classify — ERC-8004 service link detection', () => {

        test( 'detects ERC-8004 service from services array', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: AGENT_CARD_WITH_ERC8004_SERVICE } )

            expect( categories['hasErc8004ServiceLink'] ).toBe( true )
        } )


        test( 'does not detect ERC-8004 when no services array', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD } )

            expect( categories['hasErc8004ServiceLink'] ).toBe( false )
        } )


        test( 'does not detect ERC-8004 when services have no matching type', () => {
            const card = {
                ...MINIMAL_AGENT_CARD,
                services: [
                    { type: 'rest-api', url: 'https://api.example.com', description: 'REST API' }
                ]
            }
            const { categories } = CapabilityClassifier.classify( { agentCard: card } )

            expect( categories['hasErc8004ServiceLink'] ).toBe( false )
        } )


        test( 'detects ERC-8004 with hyphenated type', () => {
            const card = {
                ...MINIMAL_AGENT_CARD,
                services: [
                    { type: 'erc-8004-registry', url: 'https://registry.example.com', description: 'Registry' }
                ]
            }
            const { categories } = CapabilityClassifier.classify( { agentCard: card } )

            expect( categories['hasErc8004ServiceLink'] ).toBe( true )
        } )
    } )


    describe( 'classify — x402 detection', () => {

        test( 'detects x402 from extensions header', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD, extensions: MOCK_X402_HEADER_URI } )

            expect( categories['supportsX402'] ).toBe( true )
        } )


        test( 'does not detect x402 when extensions header is null', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD, extensions: null } )

            expect( categories['supportsX402'] ).toBe( false )
        } )


        test( 'detects x402 from agentCard capabilities extensions field', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: AGENT_CARD_WITH_X402_EXTENSION } )

            expect( categories['supportsX402'] ).toBe( true )
        } )


        test( 'does not detect x402 when extensions have unrelated URIs', () => {
            const card = {
                ...MINIMAL_AGENT_CARD,
                capabilities: {
                    extensions: [
                        { uri: 'urn:example:unrelated:v1', description: 'Unrelated', required: false }
                    ]
                }
            }
            const { categories } = CapabilityClassifier.classify( { agentCard: card } )

            expect( categories['supportsX402'] ).toBe( false )
        } )
    } )


    describe( 'classify — embedded flow detection (AP2 + x402)', () => {

        test( 'detects embedded flow when both AP2 and x402 in card extensions', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: AGENT_CARD_WITH_DUAL_EXTENSIONS } )

            expect( categories['supportsEmbeddedFlow'] ).toBe( true )
            expect( categories['supportsAp2'] ).toBe( true )
            expect( categories['supportsX402'] ).toBe( true )
        } )


        test( 'does not detect embedded flow with only AP2', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: AGENT_CARD_WITH_AP2_EXTENSION } )

            expect( categories['supportsEmbeddedFlow'] ).toBe( false )
            expect( categories['supportsAp2'] ).toBe( true )
            expect( categories['supportsX402'] ).toBe( false )
        } )


        test( 'does not detect embedded flow with only x402', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: AGENT_CARD_WITH_X402_EXTENSION } )

            expect( categories['supportsEmbeddedFlow'] ).toBe( false )
            expect( categories['supportsAp2'] ).toBe( false )
            expect( categories['supportsX402'] ).toBe( true )
        } )


        test( 'detects embedded flow from dual header URI', () => {
            const { categories } = CapabilityClassifier.classify( { agentCard: MINIMAL_AGENT_CARD, extensions: MOCK_DUAL_HEADER_URI } )

            expect( categories['supportsEmbeddedFlow'] ).toBe( true )
        } )
    } )


    describe( 'classify — combined AP2 + ERC-8004', () => {

        test( 'detects both AP2 and ERC-8004 simultaneously', () => {
            const card = {
                ...AGENT_CARD_WITH_ERC8004_SERVICE,
                capabilities: {
                    ...MINIMAL_AGENT_CARD['capabilities'],
                    extensions: [
                        { uri: 'https://github.com/google-agentic-commerce/AP2/v1.0', description: 'AP2', required: false }
                    ]
                }
            }
            const { categories } = CapabilityClassifier.classify( { agentCard: card, extensions: MOCK_EXTENSIONS_HEADER } )

            expect( categories['supportsAp2'] ).toBe( true )
            expect( categories['hasErc8004ServiceLink'] ).toBe( true )
        } )
    } )
} )
