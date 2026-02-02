// --- Test Endpoint ---

const TEST_ENDPOINT = 'https://agent.example.com'


// --- Valid Agent Card (all fields) ---

const VALID_AGENT_CARD = {
    name: 'Recipe Agent',
    description: 'Agent that helps users with recipes and cooking.',
    version: '1.0.0',
    documentation_url: 'https://docs.example.com/recipe-agent',
    provider: {
        url: 'https://example.com',
        organization: 'Example Corp'
    },
    supported_interfaces: [
        {
            url: 'https://agent.example.com/a2a/v1',
            protocol_binding: 'JSONRPC',
            protocol_version: '0.3'
        },
        {
            url: 'https://grpc.example.com/a2a',
            protocol_binding: 'GRPC',
            protocol_version: '0.3'
        }
    ],
    capabilities: {
        streaming: true,
        push_notifications: false,
        extended_agent_card: true,
        extensions: []
    },
    security_schemes: {
        oauth2: {
            type: 'oauth2',
            flows: {
                authorizationCode: {
                    authorizationUrl: 'https://auth.example.com/authorize',
                    tokenUrl: 'https://auth.example.com/token',
                    scopes: {
                        read: 'Read access',
                        write: 'Write access'
                    }
                }
            }
        }
    },
    default_input_modes: [ 'text/plain', 'application/json' ],
    default_output_modes: [ 'text/plain', 'application/json' ],
    skills: [
        {
            id: 'find-recipe',
            name: 'Find Recipe',
            description: 'Finds recipes based on ingredients or cuisine type.',
            tags: [ 'cooking', 'recipes', 'food' ],
            examples: [ 'Find me a pasta recipe', 'What can I cook with chicken?' ]
        },
        {
            id: 'nutrition-info',
            name: 'Nutrition Info',
            description: 'Provides nutritional information for recipes.',
            tags: [ 'nutrition', 'health' ]
        }
    ]
}


// --- Minimal Agent Card (required fields only) ---

const MINIMAL_AGENT_CARD = {
    name: 'Minimal Agent',
    description: 'A minimal agent.',
    version: '0.1.0',
    supported_interfaces: [
        {
            url: 'https://agent.example.com/a2a/v1',
            protocol_binding: 'JSONRPC',
            protocol_version: '0.3'
        }
    ],
    capabilities: {},
    default_input_modes: [ 'text/plain' ],
    default_output_modes: [ 'text/plain' ],
    skills: [
        {
            id: 'echo',
            name: 'Echo',
            description: 'Echoes back the input.',
            tags: [ 'utility' ]
        }
    ]
}


// --- Agent Card with OAuth2 ---

const AGENT_CARD_WITH_OAUTH2 = {
    ...MINIMAL_AGENT_CARD,
    security_schemes: {
        oauth2: {
            type: 'oauth2',
            flows: {
                authorizationCode: {
                    authorizationUrl: 'https://auth.example.com/authorize',
                    tokenUrl: 'https://auth.example.com/token'
                }
            }
        }
    }
}


// --- Agent Card with Extensions ---

const AGENT_CARD_WITH_EXTENSIONS = {
    ...MINIMAL_AGENT_CARD,
    capabilities: {
        streaming: true,
        extensions: [
            {
                uri: 'urn:example:extension:v1',
                description: 'Custom extension for enhanced processing',
                required: false
            }
        ]
    }
}


// --- Expected Category Keys (12) ---

const EXPECTED_CATEGORY_KEYS = [
    'isReachable',
    'hasAgentCard',
    'hasValidStructure',
    'hasSkills',
    'hasSecuritySchemes',
    'hasProvider',
    'supportsStreaming',
    'supportsPushNotifications',
    'supportsJsonRpc',
    'supportsGrpc',
    'supportsExtendedCard',
    'hasDocumentation'
]


// --- Expected Entry Keys (13) ---

const EXPECTED_ENTRY_KEYS = [
    'url',
    'agentName',
    'agentDescription',
    'agentVersion',
    'providerOrganization',
    'providerUrl',
    'skillCount',
    'skills',
    'protocolBindings',
    'protocolVersion',
    'defaultInputModes',
    'defaultOutputModes',
    'timestamp'
]


// --- Full Categories (all true) ---

const FULL_CATEGORIES = {
    isReachable: true,
    hasAgentCard: true,
    hasValidStructure: true,
    hasSkills: true,
    hasSecuritySchemes: true,
    hasProvider: true,
    supportsStreaming: true,
    supportsPushNotifications: true,
    supportsJsonRpc: true,
    supportsGrpc: true,
    supportsExtendedCard: true,
    hasDocumentation: true
}


// --- Empty Categories (all false) ---

const EMPTY_CATEGORIES = {
    isReachable: false,
    hasAgentCard: false,
    hasValidStructure: false,
    hasSkills: false,
    hasSecuritySchemes: false,
    hasProvider: false,
    supportsStreaming: false,
    supportsPushNotifications: false,
    supportsJsonRpc: false,
    supportsGrpc: false,
    supportsExtendedCard: false,
    hasDocumentation: false
}


export {
    TEST_ENDPOINT,
    VALID_AGENT_CARD,
    MINIMAL_AGENT_CARD,
    AGENT_CARD_WITH_OAUTH2,
    AGENT_CARD_WITH_EXTENSIONS,
    EXPECTED_CATEGORY_KEYS,
    EXPECTED_ENTRY_KEYS,
    FULL_CATEGORIES,
    EMPTY_CATEGORIES
}
