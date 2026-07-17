class A2aConnector {


    static async fetch( { endpoint, timeout } ) {
        const struct = { status: false, findings: [], agentCard: null, extensions: null }

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

            const extensionsHeader = response.headers && typeof response.headers.get === 'function'
                ? response.headers.get( 'X-A2A-Extensions' )
                : null
            struct['extensions'] = extensionsHeader || null

            if( response.status === 404 ) {
                struct['findings'].push( { code: 'CON-111', severity: 'info', location: null, message: 'Agent Card not found (HTTP 404)' } )

                return struct
            }

            if( !response.ok ) {
                struct['findings'].push( { code: 'CON-112', severity: 'info', location: null, message: `HTTP error (${response.status})` } )

                return struct
            }

            const text = await response.text()

            try {
                const agentCard = JSON.parse( text )
                struct['status'] = true
                struct['agentCard'] = agentCard
            } catch( _e ) {
                struct['findings'].push( { code: 'CON-113', severity: 'info', location: null, message: 'Response is not valid JSON' } )
            }
        } catch( err ) {
            clearTimeout( timeoutId )

            if( err.name === 'AbortError' ) {
                struct['findings'].push( { code: 'CON-114', severity: 'info', location: null, message: 'Request timeout exceeded' } )
            } else {
                struct['findings'].push( { code: 'CON-110', severity: 'info', location: null, message: 'Server not reachable' } )
            }
        }

        return struct
    }
}


export { A2aConnector }
