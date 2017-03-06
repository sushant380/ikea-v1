/**
  @author mrdoob / http://mrdoob.com/
 http://stackoverflow.com/questions/35070048/export-a-three-js-textured-model-to-a-obj-with-mtl-file
 
 + own modifications...
 
 **/

THREE.OBJExporter = function () {
	this.filePath,
	this.fileName,
	this.imagesToInclude=[]
};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,
	
	fileName:'',
	
	parse: function ( object ) {

	var output = '';
		var materials = {};

		var indexVertex = 0;
		var indexVertexUvs = 0;
		var indexNormals = 0;
      	
	var mtlFileName = this.fileName//'objmaterial'; // maybe this value can be passed as parameter
	output += 'mtllib ' + mtlFileName +  '.mtl\n';

		var parseMesh = function ( mesh ) {

			var nbVertex = 0;
			var nbVertexUvs = 0;
			var nbNormals = 0;

			var geometry = mesh.geometry;
			var material = mesh.material;

			if ( geometry instanceof THREE.Geometry ) {

				output += 'o ' + mesh.name + '\n';

				var vertices = geometry.vertices;

				for ( var i = 0, l = vertices.length; i < l; i ++ ) {

					var vertex = vertices[ i ].clone();
					vertex.applyMatrix4( mesh.matrixWorld );

					output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					nbVertex ++;

				}

				// uvs

				var faces = geometry.faces;
				var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
				var hasVertexUvs = faces.length === faceVertexUvs.length;

				if ( hasVertexUvs ) {

					for ( var i = 0, l = faceVertexUvs.length; i < l; i ++ ) {

						var vertexUvs = faceVertexUvs[ i ];

						for ( var j = 0, jl = vertexUvs.length; j < jl; j ++ ) {

							var uv = vertexUvs[ j ];

							output += 'vt ' + uv.x + ' ' + uv.y + '\n';

							nbVertexUvs ++;

						}

					}

				}

				// normals

				var normalMatrixWorld = new THREE.Matrix3();
				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				for ( var i = 0, l = faces.length; i < l; i ++ ) {

					var face = faces[ i ];
					var vertexNormals = face.vertexNormals;

					if ( vertexNormals.length === 3 ) {

						for ( var j = 0, jl = vertexNormals.length; j < jl; j ++ ) {

							var normal = vertexNormals[ j ].clone();
							normal.applyMatrix3( normalMatrixWorld );

							output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

							nbNormals ++;

						}

					} else {

						var normal = face.normal.clone();
						normal.applyMatrix3( normalMatrixWorld );

						for ( var j = 0; j < 3; j ++ ) {

							output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

							nbNormals ++;

						}

					}

				}
              
			// material
              
			if (material.name !== '')
				output += 'usemtl ' + material.name + '\n';
			else
				output += 'usemtl material' + material.id + '\n';
              
			materials[material.id] = material;

				// faces


				for ( var i = 0, j = 1, l = faces.length; i < l; i ++, j += 3 ) {

					var face = faces[ i ];

					output += 'f ';
					output += ( indexVertex + face.a + 1 ) + '/' + ( hasVertexUvs ? ( indexVertexUvs + j     ) : '' ) + '/' + ( indexNormals + j     ) + ' ';
					output += ( indexVertex + face.b + 1 ) + '/' + ( hasVertexUvs ? ( indexVertexUvs + j + 1 ) : '' ) + '/' + ( indexNormals + j + 1 ) + ' ';
					output += ( indexVertex + face.c + 1 ) + '/' + ( hasVertexUvs ? ( indexVertexUvs + j + 2 ) : '' ) + '/' + ( indexNormals + j + 2 ) + '\n';

				}

			} else {

				console.warn( 'THREE.OBJExporter.parseMesh(): geometry type unsupported', mesh );
				// TODO: Support only BufferGeometry and use use setFromObject()

			}

			// update index
			indexVertex += nbVertex;
			indexVertexUvs += nbVertexUvs;
			indexNormals += nbNormals;

		};

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) parseMesh( child );

		} );
      		
	// mtl output
      
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