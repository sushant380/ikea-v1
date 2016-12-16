

function ExporterHelper() {

this.detachChildren = function(mesh) {
			if(mesh.children== undefined) return
			for(var i=0;i<mesh.children.length;i++) {
			
				console.log( )
				if(mesh.children[i].type=="Mesh" && mesh.children[i].userData.isVisibleFromOutside) {
					this.detachChildren(mesh.children[i])
					THREE.SceneUtils.detach(mesh.children[i], mesh, scene)
				}	
			}
		},
		
this.detachScene = function() {
			this.detachChildren(scene)
	},
		
this.exportToObj = function() {
				/** TODO 
					- detach childs first
					- exclude light and camera
					**/
				this.detachScene() // detach intersting parts
		
				var exporter = new THREE.OBJExporter();
				exporter.filePath= mProx.texturePath
				exporter.fileName = "SceneExport"
				var result = exporter.parse( scene );
				//console.log(result)
					
				/** JSZip **/
				
				var zip = new JSZip();
				zip.file(exporter.fileName+".obj", result.obj);
				zip.file(exporter.fileName+".mtl", result.mtl);
			
				//console.log(zip)
				zip.generateAsync({type:"blob"})
				.then(function(content) {

					saveString( content, 'example.zip' );
				});
				
				
				function saveString( text, filename ) {
					save( new Blob( [ text ], { type: 'text/plain' } ), filename );
				}
				function save( blob, filename ) {
					
					try {
					var link = document.createElement( 'a' );
						link.style.display = 'none';
						document.body.appendChild( link ); // Firefox workaround, see #6594

					link.href = URL.createObjectURL( blob );
					link.download = filename || 'data.json';
					link.click();
					}
					catch(e) {
						
					}
				}
		},
		
this.exportToJSON = function() {
				//console.log(scene)
				var output = scene.toJSON();

				try {

					output = JSON.stringify( output, null, '\t' );
					output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

				} catch ( e ) {

					output = JSON.stringify( output );

				}

		this.saveString( output, 'scene.json' );

		} 

	/** end exporter test **/
}
