/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	
};
CKEDITOR.on( 'fileUploadRequest', function( evt ) {
	   console.log('rete');
	    evt.stop();
	}, null, null, 4 ); 
