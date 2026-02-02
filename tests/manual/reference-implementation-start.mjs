import { A2aAgentValidator } from '../../src/index.mjs'


// --- Configuration ---
const ENDPOINT = process.env.A2A_ENDPOINT || 'https://agent.example.com'


// --- 1. Standalone Validation (start) ---
console.log( '\n=== A2aAgentValidator.start ===' )
console.log( `Endpoint: ${ENDPOINT}` )

try {
    const { status, messages, categories, entries } = await A2aAgentValidator.start( { endpoint: ENDPOINT, timeout: 15000 } )

    console.log( `\nStatus: ${status}` )
    console.log( `Messages: ${messages.length}` )

    messages
        .forEach( ( msg ) => {
            console.log( `  - ${msg}` )
        } )

    console.log( '\nCategories:' )
    Object.entries( categories )
        .forEach( ( [ key, value ] ) => {
            console.log( `  ${key}: ${value}` )
        } )

    console.log( '\nEntries:' )
    console.log( `  Agent: ${entries['agentName']} v${entries['agentVersion']}` )
    console.log( `  Skills: ${entries['skillCount']}` )
    console.log( `  Protocols: ${entries['protocolBindings']}` )
    console.log( `  Protocol Version: ${entries['protocolVersion']}` )
} catch( err ) {
    console.log( `Error: ${err.message}` )
}


// --- 2. Simple Validation (validate) ---
console.log( '\n=== A2aAgentValidator.validate ===' )

try {
    const { status, messages } = await A2aAgentValidator.validate( { endpoint: ENDPOINT } )

    console.log( `Status: ${status}` )
    console.log( `Messages: ${messages.length}` )

    messages
        .forEach( ( msg ) => {
            console.log( `  - ${msg}` )
        } )
} catch( err ) {
    console.log( `Error: ${err.message}` )
}

console.log( '\nDone.' )
