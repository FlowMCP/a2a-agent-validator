class Validation {


    static validationValidate( { endpoint } ) {
        const struct = { status: false, findings: [] }

        if( endpoint === undefined ) {
            struct['findings'].push( { code: 'VAL-101', severity: 'error', location: 'endpoint', message: 'Missing value' } )
        } else if( typeof endpoint !== 'string' ) {
            struct['findings'].push( { code: 'VAL-102', severity: 'error', location: 'endpoint', message: 'Must be a string' } )
        } else if( endpoint.trim() === '' ) {
            struct['findings'].push( { code: 'VAL-103', severity: 'error', location: 'endpoint', message: 'Must not be empty' } )
        } else {
            try {
                new URL( endpoint )
            } catch( _e ) {
                struct['findings'].push( { code: 'VAL-104', severity: 'error', location: 'endpoint', message: 'Must be a valid URL' } )
            }
        }

        if( struct['findings'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static validationStart( { endpoint, timeout } ) {
        const struct = { status: false, findings: [] }

        if( endpoint === undefined ) {
            struct['findings'].push( { code: 'VAL-101', severity: 'error', location: 'endpoint', message: 'Missing value' } )
        } else if( typeof endpoint !== 'string' ) {
            struct['findings'].push( { code: 'VAL-102', severity: 'error', location: 'endpoint', message: 'Must be a string' } )
        } else if( endpoint.trim() === '' ) {
            struct['findings'].push( { code: 'VAL-103', severity: 'error', location: 'endpoint', message: 'Must not be empty' } )
        } else {
            try {
                new URL( endpoint )
            } catch( _e ) {
                struct['findings'].push( { code: 'VAL-104', severity: 'error', location: 'endpoint', message: 'Must be a valid URL' } )
            }
        }

        if( timeout !== undefined ) {
            if( typeof timeout !== 'number' ) {
                struct['findings'].push( { code: 'VAL-105', severity: 'error', location: 'timeout', message: 'Must be a number' } )
            } else if( timeout <= 0 ) {
                struct['findings'].push( { code: 'VAL-106', severity: 'error', location: 'timeout', message: 'Must be greater than 0' } )
            }
        }

        if( struct['findings'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static validationCompare( { before, after } ) {
        const struct = { status: false, findings: [] }

        if( before === undefined ) {
            struct['findings'].push( { code: 'VAL-107', severity: 'error', location: 'before', message: 'Missing value' } )
        } else if( before === null || typeof before !== 'object' || Array.isArray( before ) ) {
            struct['findings'].push( { code: 'VAL-107', severity: 'error', location: 'before', message: 'Must be an object' } )
        } else if( !before['categories'] || !before['entries'] ) {
            struct['findings'].push( { code: 'VAL-107', severity: 'error', location: 'before', message: 'Missing categories or entries' } )
        }

        if( after === undefined ) {
            struct['findings'].push( { code: 'VAL-108', severity: 'error', location: 'after', message: 'Missing value' } )
        } else if( after === null || typeof after !== 'object' || Array.isArray( after ) ) {
            struct['findings'].push( { code: 'VAL-108', severity: 'error', location: 'after', message: 'Must be an object' } )
        } else if( !after['categories'] || !after['entries'] ) {
            struct['findings'].push( { code: 'VAL-108', severity: 'error', location: 'after', message: 'Missing categories or entries' } )
        }

        if( struct['findings'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static error( { findings } ) {
        const messageStr = findings
            .map( ( finding ) => `${finding['code']} ${finding['location']}: ${finding['message']}` )
            .join( ', ' )

        throw new Error( messageStr )
    }
}


export { Validation }
