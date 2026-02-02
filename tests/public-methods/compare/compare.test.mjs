import { A2aAgentValidator } from '../../../src/A2aAgentValidator.mjs'
import { TEST_ENDPOINT, FULL_CATEGORIES, EMPTY_CATEGORIES } from '../../helpers/config.mjs'


const SNAPSHOT_A = {
    categories: { ...FULL_CATEGORIES },
    entries: {
        url: TEST_ENDPOINT,
        agentName: 'Recipe Agent',
        agentDescription: 'Agent that helps users with recipes.',
        agentVersion: '1.0.0',
        providerOrganization: 'Example Corp',
        providerUrl: 'https://example.com',
        skillCount: 2,
        skills: [
            { id: 'find-recipe', name: 'Find Recipe' },
            { id: 'nutrition-info', name: 'Nutrition Info' }
        ],
        protocolBindings: [ 'JSONRPC', 'GRPC' ],
        protocolVersion: '0.3',
        defaultInputModes: [ 'text/plain' ],
        defaultOutputModes: [ 'text/plain' ],
        securitySchemes: { oauth2: { type: 'oauth2' } },
        timestamp: '2025-01-01T00:00:00.000Z'
    }
}

const SNAPSHOT_B = {
    categories: { ...FULL_CATEGORIES },
    entries: {
        url: TEST_ENDPOINT,
        agentName: 'Recipe Agent',
        agentDescription: 'Agent that helps users with recipes.',
        agentVersion: '1.0.0',
        providerOrganization: 'Example Corp',
        providerUrl: 'https://example.com',
        skillCount: 2,
        skills: [
            { id: 'find-recipe', name: 'Find Recipe' },
            { id: 'nutrition-info', name: 'Nutrition Info' }
        ],
        protocolBindings: [ 'JSONRPC', 'GRPC' ],
        protocolVersion: '0.3',
        defaultInputModes: [ 'text/plain' ],
        defaultOutputModes: [ 'text/plain' ],
        securitySchemes: { oauth2: { type: 'oauth2' } },
        timestamp: '2025-01-02T00:00:00.000Z'
    }
}


describe( 'A2aAgentValidator.compare', () => {

    describe( 'parameter validation', () => {

        test( 'throws when before is missing', () => {
            expect( () => A2aAgentValidator.compare( { after: SNAPSHOT_B } ) ).toThrow( /VAL-007/ )
        } )


        test( 'throws when after is missing', () => {
            expect( () => A2aAgentValidator.compare( { before: SNAPSHOT_A } ) ).toThrow( /VAL-008/ )
        } )


        test( 'throws when before is not an object', () => {
            expect( () => A2aAgentValidator.compare( { before: 'invalid', after: SNAPSHOT_B } ) ).toThrow( /VAL-007/ )
        } )


        test( 'throws when after is not an object', () => {
            expect( () => A2aAgentValidator.compare( { before: SNAPSHOT_A, after: null } ) ).toThrow( /VAL-008/ )
        } )


        test( 'throws when before is missing categories', () => {
            expect( () => A2aAgentValidator.compare( { before: { entries: {} }, after: SNAPSHOT_B } ) ).toThrow( /VAL-007/ )
        } )


        test( 'throws when after is missing entries', () => {
            expect( () => A2aAgentValidator.compare( { before: SNAPSHOT_A, after: { categories: {} } } ) ).toThrow( /VAL-008/ )
        } )


        test( 'throws when before is an array', () => {
            expect( () => A2aAgentValidator.compare( { before: [], after: SNAPSHOT_B } ) ).toThrow( /VAL-007/ )
        } )
    } )


    describe( 'identical snapshots', () => {

        test( 'reports no changes for identical snapshots', () => {
            const { status, messages, hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after: SNAPSHOT_B } )

            expect( status ).toBe( true )
            expect( messages ).toHaveLength( 0 )
            expect( hasChanges ).toBe( false )
            expect( Object.keys( diff['identity']['changed'] ) ).toHaveLength( 0 )
        } )


        test( 'returns all diff sections', () => {
            const { diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after: SNAPSHOT_B } )
            const sections = Object.keys( diff )

            expect( sections ).toEqual( [ 'identity', 'capabilities', 'skills', 'interfaces', 'security', 'categories' ] )
        } )
    } )


    describe( 'identity diff', () => {

        test( 'detects name change', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: { ...SNAPSHOT_B['entries'], agentName: 'New Recipe Agent' }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['identity']['changed']['agentName'] ).toEqual( {
                before: 'Recipe Agent',
                after: 'New Recipe Agent'
            } )
        } )


        test( 'detects version change', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: { ...SNAPSHOT_B['entries'], agentVersion: '2.0.0' }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['identity']['changed']['agentVersion'] ).toEqual( {
                before: '1.0.0',
                after: '2.0.0'
            } )
        } )


        test( 'detects description change', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: { ...SNAPSHOT_B['entries'], agentDescription: 'Updated description.' }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['identity']['changed']['agentDescription'] ).toBeDefined()
        } )
    } )


    describe( 'capabilities diff', () => {

        test( 'detects streaming capability change', () => {
            const after = {
                ...SNAPSHOT_B,
                categories: { ...FULL_CATEGORIES, supportsStreaming: false }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['capabilities']['changed']['supportsStreaming'] ).toEqual( {
                before: true,
                after: false
            } )
        } )


        test( 'detects push notifications change', () => {
            const before = {
                ...SNAPSHOT_A,
                categories: { ...FULL_CATEGORIES, supportsPushNotifications: false }
            }

            const after = {
                ...SNAPSHOT_B,
                categories: { ...FULL_CATEGORIES, supportsPushNotifications: true }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['capabilities']['changed']['supportsPushNotifications'] ).toBeDefined()
        } )
    } )


    describe( 'skills diff', () => {

        test( 'detects added skills', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: {
                    ...SNAPSHOT_B['entries'],
                    skills: [
                        ...SNAPSHOT_B['entries']['skills'],
                        { id: 'meal-plan', name: 'Meal Plan' }
                    ]
                }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['skills']['added'] ).toContain( 'meal-plan' )
        } )


        test( 'detects removed skills', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: {
                    ...SNAPSHOT_B['entries'],
                    skills: [ { id: 'find-recipe', name: 'Find Recipe' } ]
                }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['skills']['removed'] ).toContain( 'nutrition-info' )
        } )


        test( 'detects modified skill name', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: {
                    ...SNAPSHOT_B['entries'],
                    skills: [
                        { id: 'find-recipe', name: 'Search Recipe' },
                        { id: 'nutrition-info', name: 'Nutrition Info' }
                    ]
                }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['skills']['modified'] ).toEqual( [
                { id: 'find-recipe', field: 'name', before: 'Find Recipe', after: 'Search Recipe' }
            ] )
        } )
    } )


    describe( 'interfaces diff', () => {

        test( 'detects added protocol binding', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: {
                    ...SNAPSHOT_B['entries'],
                    protocolBindings: [ 'JSONRPC', 'GRPC', 'HTTP+JSON' ]
                }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['interfaces']['added'] ).toContain( 'HTTP+JSON' )
        } )


        test( 'detects removed protocol binding', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: {
                    ...SNAPSHOT_B['entries'],
                    protocolBindings: [ 'JSONRPC' ]
                }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['interfaces']['removed'] ).toContain( 'GRPC' )
        } )
    } )


    describe( 'security diff', () => {

        test( 'detects added security scheme', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: {
                    ...SNAPSHOT_B['entries'],
                    securitySchemes: {
                        oauth2: { type: 'oauth2' },
                        apikey: { type: 'apiKey' }
                    }
                }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['security']['added'] ).toContain( 'apikey' )
        } )


        test( 'detects removed security scheme', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: {
                    ...SNAPSHOT_B['entries'],
                    securitySchemes: {}
                }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['security']['removed'] ).toContain( 'oauth2' )
        } )
    } )


    describe( 'categories diff', () => {

        test( 'detects boolean flag change', () => {
            const after = {
                ...SNAPSHOT_B,
                categories: { ...FULL_CATEGORIES, hasProvider: false }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['categories']['changed']['hasProvider'] ).toEqual( {
                before: true,
                after: false
            } )
        } )


        test( 'detects multiple category changes', () => {
            const after = {
                ...SNAPSHOT_B,
                categories: { ...FULL_CATEGORIES, hasProvider: false, hasSkills: false }
            }

            const { diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( Object.keys( diff['categories']['changed'] ) ).toHaveLength( 2 )
        } )
    } )


    describe( 'null fallback handling', () => {

        test( 'handles null skills in before snapshot', () => {
            const before = {
                ...SNAPSHOT_A,
                entries: { ...SNAPSHOT_A['entries'], skills: null }
            }

            const after = {
                ...SNAPSHOT_B,
                entries: { ...SNAPSHOT_B['entries'], skills: [ { id: 'new', name: 'New' } ] }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['skills']['added'] ).toContain( 'new' )
        } )


        test( 'handles null protocolBindings in after snapshot', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: { ...SNAPSHOT_B['entries'], protocolBindings: null }
            }

            const { hasChanges, diff } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( hasChanges ).toBe( true )
            expect( diff['interfaces']['removed'] ).toContain( 'JSONRPC' )
            expect( diff['interfaces']['removed'] ).toContain( 'GRPC' )
        } )


        test( 'handles undefined securitySchemes in both snapshots', () => {
            const before = {
                ...SNAPSHOT_A,
                entries: { ...SNAPSHOT_A['entries'], securitySchemes: undefined }
            }

            const after = {
                ...SNAPSHOT_B,
                entries: { ...SNAPSHOT_B['entries'], securitySchemes: undefined }
            }

            const { diff } = A2aAgentValidator.compare( { before, after } )

            expect( diff['security']['added'] ).toHaveLength( 0 )
            expect( diff['security']['removed'] ).toHaveLength( 0 )
        } )
    } )


    describe( 'warning messages', () => {

        test( 'warns when snapshots are from different agents', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: { ...SNAPSHOT_B['entries'], url: 'https://other-agent.example.com' }
            }

            const { messages } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( messages ).toContain( 'CMP-001 compare: Snapshots are from different agents' )
        } )


        test( 'warns when before snapshot has no timestamp', () => {
            const before = {
                ...SNAPSHOT_A,
                entries: { ...SNAPSHOT_A['entries'], timestamp: null }
            }

            const { messages } = A2aAgentValidator.compare( { before, after: SNAPSHOT_B } )

            expect( messages ).toContain( 'CMP-002 compare: Before snapshot has no timestamp' )
        } )


        test( 'warns when after snapshot is older than before', () => {
            const after = {
                ...SNAPSHOT_B,
                entries: { ...SNAPSHOT_B['entries'], timestamp: '2024-12-31T00:00:00.000Z' }
            }

            const { messages } = A2aAgentValidator.compare( { before: SNAPSHOT_A, after } )

            expect( messages ).toContain( 'CMP-003 compare: After snapshot is older than before' )
        } )
    } )
} )
