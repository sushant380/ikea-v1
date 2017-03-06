/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJExporter = function () {
	this.filePath,
	this.fileName,
	this.imagesToInclude=[]
};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,


	parse: function ( object ) {
		this.imagesToInclude

		var output = '';

		var materials = {};

		var indexVertex = 0;
		var indexVertexUvs = 0;
		var indexNormals = 0;

		var vertex = new THREE.Vector3();
		var normal = new THREE.Vector3();
		var uv = new THREE.Vector2();

		var i, j, l, m, face = [];

		var parseMesh = function ( mesh ) {

			var nbVertex = 0;
			var nbNormals = 0;
			var nbVertexUvs = 0;

			var geometry = mesh.geometry;
			var material = mesh.material;


			var normalMatrixWorld = new THREE.Matrix3();

			if ( geometry instanceof THREE.Geometry ) {

				geometry = new THREE.BufferGeometry().setFromObject( mesh );

			}

			if ( geometry instanceof THREE.BufferGeometry ) {

				// shortcuts
				var vertices = geometry.getAttribute( 'position' );
				var normals = geometry.getAttribute( 'normal' );
				var uvs = geometry.getAttribute( 'uv' );
				var indices = geometry.getIndex();

				// name of the mesh object
				output += 'o ' + mesh.name + '\n';

				// vertices

				if( vertices !== undefined ) {

					for ( i = 0, l = vertices.count; i < l; i ++, nbVertex++ ) {

						vertex.x = vertices.getX( i );
						vertex.y = vertices.getY( i );
						vertex.z = vertices.getZ( i );

						// transfrom the vertex to world space
						vertex.applyMatrix4( mesh.matrixWorld );

						// transform the vertex to export format
						output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					}

				}

				// uvs

				if( uvs !== undefined ) {

					for ( i = 0, l = uvs.count; i < l; i ++, nbVertexUvs++ ) {

						uv.x = uvs.getX( i );
						uv.y = uvs.getY( i );

						// transform the uv to export format
						output += 'vt ' + uv.x + ' ' + uv.y + '\n';

					}

				}

				// normals

				if( normals !== undefined ) {

					normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

					for ( i = 0, l = normals.count; i < l; i ++, nbNormals++ ) {

						normal.x = normals.getX( i );
						normal.y = normals.getY( i );
						normal.z = normals.getZ( i );

						// transfrom the normal to world space
						normal.applyMatrix3( normalMatrixWorld );

						// transform the normal to export format
						output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

					}

				}

				// faces

				if( indices !== null ) {

					for ( i = 0, l = indices.count; i < l; i += 3 ) {

						for( m = 0; m < 3; m ++ ){

							j = indices.getX( i + m ) + 1;

							face[ m ] = ( indexVertex + j ) + '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + '/' + ( indexNormals + j );

						}

						// transform the face to export format
						output += 'f ' + face.join( ' ' ) + "\n";

					}

				} else {

					for ( i = 0, l = vertices.count; i < l; i += 3 ) {

						for( m = 0; m < 3; m ++ ){

							j = i + m + 1;

							face[ m ] = ( indexVertex + j ) + '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + '/' + ( indexNormals + j );

						}

						// transform the face to export format
						output += 'f ' + face.join( ' ' ) + "\n";

					}

				}

			} else {

				console.warn( 'THREE.OBJExporter.parseMesh(): geometry type unsupported', geometry );

			}


			if (material.name !== '')
				output += 'usemtl ' + material.name + '\n';
			else
				output += 'usemtl material' + material.id + '\n';
              
			materials[material.id] = material;
			// update index
			indexVertex += nbVertex;
			indexVertexUvs += nbVertexUvs;
			indexNormals += nbNormals;

		};

		var parseLine = function( line ) {

			var nbVertex = 0;

			var geometry = line.geometry;
			var type = line.type;

			if ( geometry instanceof THREE.Geometry ) {

				geometry = new THREE.BufferGeometry().setFromObject( line );

			}

			if ( geometry instanceof THREE.BufferGeometry ) {

				// shortcuts
				var vertices = geometry.getAttribute( 'position' );
				var indices = geometry.getIndex();

				// name of the line object
				output += 'o ' + line.name + '\n';

				if( vertices !== undefined ) {

					for ( i = 0, l = vertices.count; i < l; i ++, nbVertex++ ) {

						vertex.x = vertices.getX( i );
						vertex.y = vertices.getY( i );
						vertex.z = vertices.getZ( i );

						// transfrom the vertex to world space
						vertex.applyMatrix4( line.matrixWorld );

						// transform the vertex to export format
						output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					}

				}

				if ( type === 'Line' ) {

					output += 'l ';

					for ( j = 1, l = vertices.count; j <= l; j++ ) {

						output += ( indexVertex + j ) + ' ';

					}

					output += '\n';

				}

				if ( type === 'LineSegments' ) {

					for ( j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1 ) {

						output += 'l ' + ( indexVertex + j ) + ' ' + ( indexVertex + k ) + '\n';

					}

				}

			} else {

				console.warn('THREE.OBJExporter.parseLine(): geometry type unsupported', geometry );

			}

			// update index
			indexVertex += nbVertex;

		};

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				parseMesh( child );

			}

			if ( child instanceof THREE.Line ) {

				parseLine( child );

			}

		} );

		var mtlOutput = '';
	
	// modification, ensure that we only have one unique material 
	var matAddedRepository = []
	var newMaterialObj = {}
	for (var key in materials) { 
		var checkAdded
		var mat = materials[key];
		if (mat.name !== '')
			checkAdded = 'newmtl ' + mat.name + '\n';
		else
			checkAdded = 'newmtl material' + mat.id + '\n';
		
		if(matAddedRepository.indexOf(checkAdded)<0) { // it as not already been referenced so lets keep it
			matAddedRepository.push(checkAdded)
			newMaterialObj[key]=materials[key]
		}
		
	}
	
	// 
	
	for (var key in newMaterialObj) { // materials) {
        
		var mat = materials[key];
		if(mat instanceof THREE.MultiMaterial){
			for(var x=0;x<mat.materials.length;x++){
			if (mat.materials[x].name !== '')
			mtlOutput += 'newmtl ' + mat.materials[x].name + '\n';
		else
			mtlOutput += 'newmtl material' + mat.materials[x].id + '\n';
          
		mtlOutput += 'Ns 10.0000\n';
		mtlOutput += 'Ni 1.5000\n';
		mtlOutput += 'd 1.0000\n';
		mtlOutput += 'Tr 0.0000\n';
		mtlOutput += 'Tf 1.0000 1.0000 1.0000\n';
		mtlOutput += 'illum 2\n';
		mtlOutput += 'Ka ' + mat.materials[x].color.r + ' ' + mat.materials[x].color.g + ' ' + mat.materials[x].color.b + ' ' + '\n';
		mtlOutput += 'Kd ' + mat.materials[x].color.r + ' ' + mat.materials[x].color.g + ' ' + mat.materials[x].color.b + ' ' + '\n';
		mtlOutput += 'Ks 0.0000 0.0000 0.0000\n';
		mtlOutput += 'Ke 0.0000 0.0000 0.0000\n';
          
		if (mat.materials[x].map && mat.materials[x].map instanceof THREE.Texture) {
          
			console.log(mat.materials[x].map)
// mod 
			var pathS = mat.materials[x].map.image.currentSrc.split("/")
			console.log(pathS)
			console.log(pathS[pathS.length-1])
			var file = mat.materials[x].name// mat.map.image.currentSrc//pathS[pathS.length-1]
			//var file = mat.map.image.currentSrc.slice( mat.map.image.currentSrc.slice.lastIndexOf("/"), mat.map.image.currentSrc.length - 1 );
//            
			mtlOutput += 'map_Ka ' + file + '\n';
			mtlOutput += 'map_Kd ' + file + '\n';
			
			this.imagesToInclude.push(file) // store which images we should also add...
            
		}
	}
		}else{
          
		if (mat.name !== '')
			mtlOutput += 'newmtl ' + mat.name + '\n';
		else
			mtlOutput += 'newmtl material' + mat.id + '\n';
          
		mtlOutput += 'Ns 10.0000\n';
		mtlOutput += 'Ni 1.5000\n';
		mtlOutput += 'd 1.0000\n';
		mtlOutput += 'Tr 0.0000\n';
		mtlOutput += 'Tf 1.0000 1.0000 1.0000\n';
		mtlOutput += 'illum 2\n';
		mtlOutput += 'Ka ' + mat.color.r + ' ' + mat.color.g + ' ' + mat.color.b + ' ' + '\n';
		mtlOutput += 'Kd ' + mat.color.r + ' ' + mat.color.g + ' ' + mat.color.b + ' ' + '\n';
		mtlOutput += 'Ks 0.0000 0.0000 0.0000\n';
		mtlOutput += 'Ke 0.0000 0.0000 0.0000\n';
          
		if (mat.map && mat.map instanceof THREE.Texture) {
          
			console.log(mat.map)
// mod 
			var pathS = mat.map.image.currentSrc.split("/")
			console.log(pathS)
			console.log(pathS[pathS.length-1])
			var file = mat.name// mat.map.image.currentSrc//pathS[pathS.length-1]
			//var file = mat.map.image.currentSrc.slice( mat.map.image.currentSrc.slice.lastIndexOf("/"), mat.map.image.currentSrc.length - 1 );
//            
			mtlOutput += 'map_Ka ' + file + '\n';
			mtlOutput += 'map_Kd ' + file + '\n';
			
			this.imagesToInclude.push(file) // store which images we should also add...
            
		}
	}
          
	}

	return {
		obj: output,
		mtl: mtlOutput
	}

	}

};
