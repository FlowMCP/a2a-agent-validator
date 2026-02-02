class A2aConnector {


    static async fetch( { endpoint, timeout } ) {
        const struct = { status: false, messages: [], agentCard: null }

        const normalizedEndpoint = endpoint.replace( /\/+$/, '' )
        const url = `${normalizedEndpoint}/.well-known/agent-card.json`

        const controller = new AbortController()
        const timeoutId = setTimeout( () => controller.abort(), timeout )

        try {
            const response = await globalThis.fetch( url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            } )

            clearTimeout( timeoutId )

            if( response.status === 404 ) {
                struct['messages'].push( 'CON-011: Agent Card not found (HTTP 404)' )

                return struct
            }

            if( !response.ok ) {
                struct['messages'].push( `CON-012: HTTP error (${response.status})` )

                return struct
            }

            const text = await response.text()

            try {
                const agentCard = JSON.parse( text )
                struct['status'] = true
                struct['agentCard'] = agentCard
            } catch( _e ) {
                struct['messages'].push( 'CON-013: Response is not valid JSON' )
            }
        } catch( err ) {
            clearTimeout( timeoutId )

            if( err.name === 'AbortError' ) {
                struct['messages'].push( 'CON-014: Request timeout exceeded' )
            } else {
                struct['messages'].push( 'CON-010: Server not reachable' )
            }
        }

        return struct
    }
}


export { A2aConnector }
