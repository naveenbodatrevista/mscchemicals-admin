import { context_path, server_url } from './constants';
 
 class CkEditorUploadAdapter {
    constructor( loader ) {
       
        this.loader = loader;
    }

    // Starts the upload process.
    upload() {
        return this.loader.file
            .then( file => new Promise( ( resolve, reject ) => {
                this._initRequest();
                this._initListeners( resolve, reject, file );
                this._sendRequest( file );
            } ) );
    }

   
    abort() {
        if ( this.xhr ) {
            this.xhr.abort();
        }
    }

   
    _initRequest() {
        const xhr = this.xhr = new XMLHttpRequest();
        var itm = JSON.parse(localStorage.getItem("designbricks-store-key"));
        
        xhr.open( 'POST', server_url+context_path+'blog/images', true );
        xhr.setRequestHeader("Authorization", 'Bearer ' + itm.login.userObj.token);
        xhr.responseType = 'json';
    }

    // Initializes XMLHttpRequest listeners.
    _initListeners( resolve, reject, file ) {
        const xhr = this.xhr;
        const loader = this.loader;
        const genericErrorText = `Couldn't upload file: ${ file.name }.`;

        xhr.addEventListener( 'error', () => reject( genericErrorText ) );
        xhr.addEventListener( 'abort', () => reject() );
        xhr.addEventListener( 'load', () => {
            const response = xhr.response;

            if ( !response || response.error ) {
                return reject( response && response.error ? response.error.message : genericErrorText );
            }

            resolve( {
                default: response.url
            } );
        } );

        
        if ( xhr.upload ) {
            xhr.upload.addEventListener( 'progress', evt => {
                if ( evt.lengthComputable ) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            } );
        }
    }

    
    _sendRequest( file ) {
        // Prepare the form data.
        const data = new FormData();

        data.append( 'image', file );

        this.xhr.send( data );
    }
}

// ...

  export default function( editor ) {
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
        // Configure the URL to the upload script in your back-end here!
        return new CkEditorUploadAdapter( loader );
    };
}
