function RoomItem(item,parent){
	this.itemType = item.itemType;
	this.w = item.w;
	this.h = item.h;
	this.d = item.d;
	this.shape = item.shape;
	this.Pos = item.Pos|| new THREE.Vector3(0,0,0);
	this.Ori = item.Ori || new THREE.Vector3(0,0,0);
	this.name = item.name;
	this.color = item.color || 0xFFFFFF;
	this.texture = item.texture;
	this.material = item.material;
	this.showWireframe = item.showWireframe;
	this.rawChildItems=item.childItems || [];
	this.childItems = []
	this.isVisibleFromOutside = true;
	this.isHost=item.isHost ||false;
	this.add=function(itm){
		if(this.obj.type=='Group'){
			this.obj.children[0].add(itm);	
		}else{
			this.obj.add(itm);
		}
		
	};
	function init(current){
		
		current.getItemObject(function(scope){
			scope.obj.position.set(scope.Pos.x, scope.Pos.y, scope.Pos.z);
			scope.obj.rotation.set(scope.Ori.x, scope.Ori.y, scope.Ori.z);
			scope.obj.name=scope.itemType;
			scope.obj.userData.itemType=scope.itemType;
			scope.obj.userData.isVisibleFromOutside = scope.isVisibleFromOutside;
			if(scope.rawChildItems && scope.rawChildItems.length){
				scope.rawChildItems.forEach(function(child){
					var childItem=new RoomItem(child,scope);
				});
			}
			if(scope.lockXTranslation!=undefined) scope.obj.userData.lockXTranslation = scope.lockXTranslation
			if(scope.lockYTranslation!=undefined) scope.obj.userData.lockYTranslation = scope.lockYTranslation
			if(scope.lockZTranslation!=undefined) scope.obj.userData.lockZTranslation = scope.lockZTranslation
			
			if(scope.isHost){
				var v3=scope.itemsOffsetPos(scope,scope.obj.getWorldDirection());
				scope.obj.position.set(v3.x,v3.y,v3.z);
			}
			if(parent)
				parent.add(scope.obj);
		});
	};
	this.getItemObject=function(callback){
		//console.log(this.itemType,this.shape);
		/*if( this.itemType == "Frame" || this.itemType == "CapSink" || this.itemType == "SinkTap"){*/
			var scope=this;
			//if(scope.shape=='IKEA.ART.90304629' || scope.shape=='IKEA.ART.40205599' || scope.shape=='IKEA.ART.00205431' || scope.shape=='IKEA.ART.00315175' || scope.shape=='IKEA.ART.30176470' || scope.shape=='IKEA.ART.50215475' || scope.shape=='IKEA.ART.60204645' || scope.shape=='IKEA.ART.60205664' || scope.shape=='IKEA.ART.90038541_LeftJustified' || scope.shape=='IKEA.ART.90038541_RightJustified' || scope.shape=='IKEA.ART.90304629' ) {
			var materialLoader=new THREE.MTLLoader();
			materialLoader.setPath('models/obj/');
		
			materialLoader.load(scope.shape+'.mtl',function(material){
					console.log(scope.shape);
					var loader = new THREE.OBJLoader();
					loader.setPath( 'models/obj/' );
					loader.setMaterials(material);
					loader.load( scope.shape+'.obj', function ( object ) {
					object.castShadow = true
					object.recieveShadow = true
					
					// wireframe
					if(scope.showWireframe ) {
						var geo = new THREE.EdgesGeometry( object.children[0].geometry ); // or WireframeGeometry
						var mat = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } );
						var wireframe = new THREE.LineSegments( geo, mat );
						//object.add(wireframe)
					}
					scope.obj = object.children[0];
					callback(scope);
				},function(){},function(){
					console.log('failed= ',scope);
					var object=new THREE.BoxGeometry(scope.w, scope.h, scope.d);
					var mesh_mat = new THREE.MeshLambertMaterial({color : scope.color, transparent: true, opacity: 0.9});
					var mesh=new THREE.Mesh(object, mesh_mat);
					mesh.castShadow = true
					mesh.recieveShadow = true
					// wireframe
					if(scope.showWireframe ) {
						var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
						var mat = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } );
						var wireframe = new THREE.LineSegments( geo, mat );
						//mesh.add(wireframe)
					}
					scope.obj = mesh;
					callback(scope);
				});
			},function(){},function(){
				console.log('failed= ',scope);
				var loader = new THREE.OBJLoader();
					loader.setPath( 'models/obj/' );
					
					loader.load( scope.shape+'.obj', function ( object ) {
					object.castShadow = true
					object.recieveShadow = true
					
					// wireframe
					if(scope.showWireframe ) {
						var geo = new THREE.EdgesGeometry( object.children[0].geometry ); // or WireframeGeometry
						var mat = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } );
						var wireframe = new THREE.LineSegments( geo, mat );
						//object.add(wireframe)
					}
					scope.obj = object.children[0];
					callback(scope);
				},function(){},function(){
					console.log('failed= ',scope);
					var object=new THREE.BoxGeometry(scope.w, scope.h, scope.d);
					var mesh_mat = new THREE.MeshLambertMaterial({color : scope.color, transparent: true, opacity: 0.9});
					var mesh=new THREE.Mesh(object, mesh_mat);
					mesh.castShadow = true
					mesh.recieveShadow = true
					// wireframe
					if(scope.showWireframe ) {
						var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
						var mat = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } );
						var wireframe = new THREE.LineSegments( geo, mat );
						//mesh.add(wireframe)
					}
					scope.obj = mesh;
					callback(scope);
				});
			});
		/*}else{
			console.log('shape not found '+scope.shape+' '+scope.name);
			var object=new THREE.BoxGeometry(this.w, this.h, this.d);
			var mesh_mat = new THREE.MeshLambertMaterial({transparent: true, opacity: 0.1});
			var mesh=new THREE.Mesh(object, mesh_mat);
			mesh.castShadow = true
			mesh.recieveShadow = true
			// wireframe
			if(this.showWireframe ) {
				var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
				var mat = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } );
				var wireframe = new THREE.LineSegments( geo, mat );
			//		mesh.add(wireframe)
			}
			this.obj = mesh;
			callback(this);
		}*/
		
	};
	 this.itemsOffsetPos=function(a,dir) {
						/** we need to adjust the POS since VP do not use center pos **/
						var crPo = a.Pos
						var maxOfWnD			// VP counts the center based on the max
						
						var oAW = a.w
						var oAD = a.d
						
						var sub = new THREE.Vector3()
						var t
						
						if(a.w<a.d) a.d=a.w
						else a.w=a.d
						
						var t
if(dir.x==0)				t = new THREE.Vector3(oAW/2, a.h/2, oAD/2)		//?? does this work for all cases?
else						t = new THREE.Vector3(a.w/2, a.h/2, a.d/2)		//??
						
						//var t = new THREE.Vector3(a.w/2, a.h/2, a.d/2)
						
						sub.addVectors(crPo, t)
						
						
						
						if(dir.z<0 && dir.x<0) {
							//console.log("offset Z: " + a.name + " " + a.d)
							t = new THREE.Vector3(a.w,0, a.d)
							sub.subVectors(sub, t)
							}
						else if(dir.z>0 && dir.x<0) {
//							console.log("offset X: " + a.name + " " + a.w)
//							console.log(crPo)

							t = new THREE.Vector3(a.w,0, 0)
							sub.subVectors(sub, t)
						}
						else if(dir.z<0 && dir.x>0) {
							t = new THREE.Vector3(a.w, 0, a.d)
							sub.subVectors(sub, t)
						}
						
						else if(dir.z>0 && dir.x>0 ) {
							t = new THREE.Vector3(0,0, a.d)
							sub.subVectors(sub, t)
						}
						return sub
}
	init(this);
}