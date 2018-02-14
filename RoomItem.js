function RoomItem(item,parent,itemsHolder){
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
	this.parent=parent;
	this.itemsHolder=itemsHolder;
	this.childLoadCount=0;
	this.opening=item.opening||"Left";
	if(parent ===undefined){
		interactiveRoomObjs.push(this);
	}
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
			scope.obj.castShadow = true

			if(scope.rawChildItems && scope.rawChildItems.length){
				scope.rawChildItems.forEach(function(child){
					var childItem=new RoomItem(child,scope);
					scope.childItems.push(childItem);
				});
			}
			if(scope.lockXTranslation!=undefined) scope.obj.userData.lockXTranslation = scope.lockXTranslation;
			if(scope.lockYTranslation!=undefined) scope.obj.userData.lockYTranslation = scope.lockYTranslation;
			if(scope.lockZTranslation!=undefined) scope.obj.userData.lockZTranslation = scope.lockZTranslation;

			if(scope.isHost){
				//scope.obj.userData.collidableWalls=scope.itemsHolder.collidableWalls;
				//scope.obj.userData.collidableWalls.push(scope.itemsHolder.collidableFloor);
				//scope.obj.userData.collidablePostItems = scope.itemsHolder.itemMeshes;
				/*var cubeMesh=[];
				var material0 = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture( 'img/open.png' ) } );
				var material1 = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture( 'img/close.png' ) } );
				cubeMesh[0] = new THREE.Mesh(new THREE.CircleGeometry(0.9, 0.25), material0);
    			cubeMesh[1] = new THREE.Mesh(new THREE.CircleGeometry(0.9, 0.25), material1);
    			cubeMesh[0].isButton=true;
    			cubeMesh[1].isButton=true;
    			cubeMesh[0].visible=false;
    			cubeMesh[1].visible=false;*/
				var v3=scope.itemsHolder.itemsOffsetPos(scope,scope.obj.getWorldDirection());
				scope.obj.position.set(v3.x,v3.y,v3.z);
				scope.obj.name=scope.name;
				/*scope.obj.add(cubeMesh[0]);
				scope.obj.add(cubeMesh[1]);*/
				scope.itemsHolder.itemMeshes.push(scope.obj);
				scope.obj.onAfterRender = function(){scope.itemsHolder.matrixAutoUpdate=false;

				};
			}
		//	interactiveObjects.push(scope.obj);

			/*if(scope.itemType==='Plinth'){


				var cube=new THREE.CubeGeometry(box.getSize().x,box.getSize().x,box.getSize().x);
				var box=new THREE.Box3().setFromObject(scope.obj);
				var leftSide=scope.obj.clone();
				var backSide=scope.obj.clone();
				var rightSide=scope.obj.clone();
				leftSide.position.z=-box.max.z;
				leftSide.position.x=-box.max.z;
				leftSide.position.y=0;
				var newRotation = new THREE.Euler( 0, (-90) * 0.017453292519943295, 0);
				leftSide.rotation.copy(newRotation);
				leftSide.name="Left Plinth";
				rightSide.position.x=box.max.z;
				rightSide.position.z=-box.max.z;
				rightSide.position.y=0;
				var newRotation = new THREE.Euler( 0, (90) * 0.017453292519943295, 0);
				rightSide.rotation.copy(newRotation);
				rightSide.name="Right Plinth";
				backSide.position.z=-box.max.x;
				backSide.name="Back Plinth";
				backSide.position.y=0;
			//	scope.obj.add(leftSide);
				scope.obj.add(backSide);
			//	scope.obj.add(rightSide);
			scope.obj.geometry=new THREE.Mesh(cube,scope.obj.material).geometry;
			}*/
			if(scope.isHost){
				scope.obj.isHost=true;

			}
			if(scope.parent){
				//console.log(scope.itemType);
				scope.parent.add(scope.obj);
				scope.parent.updateParent();
			}else if(scope.parent===undefined){
				scope.itemsHolder.scene.add(scope.obj);
			}


		});
	};
	this.updateParent=function(){
		this.childLoadCount++;
		//console.log(this.itemType);
		if(this.childLoadCount===this.rawChildItems.length){
			if(this.itemType && this.itemType.indexOf('CabWorktop')>-1){
				var cwtgeometry = new THREE.Geometry().fromBufferGeometry( this.obj.geometry );
				for(var d=0;d<this.childItems.length;d++){
					if(this.childItems[d].itemType==='CabSink' || this.childItems[d].itemType==='CabHob'){
						var box=new THREE.Box3().setFromObject(this.childItems[d].obj);
						cube = new THREE.Mesh( new THREE.CubeGeometry( box.getSize().x-0.01, box.getSize().y, box.getSize().z-0.01 ), new THREE.MeshNormalMaterial() );
						var cabworkTop=new ThreeBSP(cwtgeometry);
						var childShape=new ThreeBSP(cube);
						var subtractTop=cabworkTop.subtract(childShape);
						var result = subtractTop.toMesh( cabworkTop.material);
						result.geometry.computeVertexNormals();
						cwtgeometry=result.geometry;

					}else{
						if(this.childItems[d].obj.geometry instanceof THREE.BufferGeometry){
							var cabworkTop=new ThreeBSP(cwtgeometry);
							var childgeometry = new THREE.Geometry().fromBufferGeometry( this.childItems[d].obj.geometry );
							var childShape=new ThreeBSP(childgeometry);
							var subtractTop=cabworkTop.subtract(childShape);
							var result = subtractTop.toMesh( cabworkTop.material);
							result.geometry.computeVertexNormals();
							cwtgeometry=result.geometry;
					}
					}
				}
				this.obj.geometry=cwtgeometry;

			}
		}
	};
	this.getItemObject=function(callback){
		//console.log(this.itemType,this.shape);

		/*if( this.itemType == "Frame" || this.itemType == "CapSink" || this.itemType == "SinkTap"){*/
			var scope=this;
			//if(scope.shape=='IKEA.ART.90304629' || scope.shape=='IKEA.ART.40205599' || scope.shape=='IKEA.ART.00205431' || scope.shape=='IKEA.ART.00315175' || scope.shape=='IKEA.ART.30176470' || scope.shape=='IKEA.ART.50215475' || scope.shape=='IKEA.ART.60204645' || scope.shape=='IKEA.ART.60205664' || scope.shape=='IKEA.ART.90038541_LeftJustified' || scope.shape=='IKEA.ART.90038541_RightJustified' || scope.shape=='IKEA.ART.90304629' ) {
		// 	var materialLoader=new THREE.MTLLoader();
		// 	materialLoader.setPath('models/obj/');
		// //	console.log(scope.shape);
		// 	materialLoader.load(scope.shape+'.mtl',function(material){
					var loader = new THREE.OBJLoader();
					loader.setPath( 'models/obj/' );
					// loader.setMaterials(material);

					loader.load( scope.shape+'.obj', function ( object ) {


					// wireframe
					if(scope.showWireframe ) {

						/*var geo = new THREE.EdgesGeometry( object.children[0].geometry ); // or WireframeGeometry
						var mat = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } );
						var wireframe = new THREE.LineSegments( geo, mat );
						var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ee00, wireframe: true, transparent: true } );
						object.add(wireframeMaterial);*/
					}
					scope.obj = object.children[0];

					callback(scope);
				},function(){},function(){
					//console.log('failed= ',scope);
					var object=new THREE.BoxGeometry(scope.w, scope.h, scope.d);
					var mesh_mat=undefined;
					if(scope.name.indexOf("Obstacle")>-1){
						mesh_mat = new THREE.MeshPhongMaterial({
					   color: 0xFFFFFF,
					   emissive: new THREE.Color(0x5e5e5e),
					   shininess: 0,
					   side: THREE.DoubleSide
					  });
					//	mesh_mat = new THREE.MeshLambertMaterial({color : scope.color, transparent: false, opacity: 1});
					}else{
						mesh_mat = new THREE.MeshLambertMaterial({color : scope.color, transparent: true, opacity: 0.9});
					}
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
			// },function(){},function(){
			// 	//console.log('failed= ',scope);
			// 	var loader = new THREE.OBJLoader();
			// 		loader.setPath( 'models/obj/' );
      //
			// 		loader.load( scope.shape+'.obj', function ( object ) {
			// 		object.castShadow = true
			// 		object.recieveShadow = true
      //
			// 		// wireframe
			// 		if(scope.showWireframe ) {
			// 			var geo = new THREE.EdgesGeometry( object.children[0].geometry ); // or WireframeGeometry
			// 			var mat = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } );
			// 			var wireframe = new THREE.LineSegments( geo, mat );
			// 			//object.add(wireframe)
			// 		}
			// 		scope.obj = object.children[0];
			// 		callback(scope);
			// 	},function(){},function(){
			// 		//console.log('failed= ',scope);
			// 		var object=new THREE.BoxGeometry(scope.w, scope.h, scope.d);
			// 		var mesh_mat=undefined;
			// 		if(scope.name.indexOf("Obstacle")>-1){
			// 			mesh_mat = new THREE.MeshLambertMaterial({color : scope.color, transparent: false, opacity: 1});
			// 		}else{
			// 			mesh_mat = new THREE.MeshLambertMaterial({color : scope.color, transparent: true, opacity: 0.9});
			// 		}
      //
			// 		var mesh=new THREE.Mesh(object, mesh_mat);
			// 		mesh.castShadow = true
			// 		mesh.recieveShadow = true
			// 		// wireframe
			// 		if(scope.showWireframe ) {
			// 			var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
			// 			var mat = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } );
			// 			var wireframe = new THREE.LineSegments( geo, mat );
			// 			//mesh.add(wireframe)
			// 		}
			// 		scope.obj = mesh;
			// 		callback(scope);
			// 	});
			// });
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
	};
	this.doorsAnimation=function(doorItems,action){
		var scope=this;
		if(doorItems.length>0){
			doorItems.forEach(function(door){
				var doorData_1={},doorData_2={};
				if(action==='open'){
					if(door.opening==='Left'){
						doorData_1={angle:1,x:door.Pos.x,z:door.Pos.z};
						doorData_2={
							angle:90,
							x:-door.w/2,
							z:door.w/2+door.Pos.z
						};
					}else if(door.opening==='Right'){
						doorData_1={angle:179,x:door.Pos.x,z:door.Pos.z};
						doorData_2={
							angle:90,
							x:door.w/2,
							z:door.w/2+door.Pos.z
						};
					}
				}else if(action==='close'){
					if(door.opening==='Left'){
						doorData_1={angle:90,x:door.obj.position.x,z:door.obj.position.z};
						doorData_2={
							angle:0,
							x:door.Pos.x,
							z:door.Pos.z
						}
					}else if(door.opening==='Right'){
						doorData_1={angle:90,x:door.obj.position.x,z:door.obj.position.z};
						doorData_2={
							angle:179,
							x:door.Pos.x,
							z:door.Pos.z
						};
					}

				}
				var updateCount=0;
				var doorTween = new TWEEN.Tween(doorData_1).to(doorData_2, 1000).onUpdate(function(){
					if(updateCount==0){
						updateCount++;
						return;
					}
					var newRotation = new THREE.Euler( 0, (-doorData_1.angle) * 0.017453292519943295, 0);
	                door.obj.rotation.copy( newRotation );
	                var v=new THREE.Vector3(doorData_1.x,0,doorData_1.z);
	                door.obj.position.copy(v);
	                door.obj.updateMatrixWorld( true );
	                updateBox(scope.obj);

				}).onComplete(function(){
					console.log('completed');
				}).easing(TWEEN.Easing.Quadratic.In).start();
				animate_OC();
			});
			/*var leftOpeningDoor=undefined;
			var rightOpeningDoor=undefined;
			var leftDoorAngle1={},leftDoorAngle2={};
			if(action==='open'){
				 leftDoorAngel={angle:1,x:0,z:leftOpeningDoor.obj.position.z};
				 leftDoorAngle2={
					angle:90,
					x:-leftOpeningDoor.w/2,
					z:leftOpeningDoor.w/2+leftOpeningDoor.obj.position.z
				};
			}else{
				leftDoorAngle1={angle:90,x:0,z:leftOpeningDoor.obj.position.z};
				leftDoorAngle2={
					angle:0,
					x:leftOpeningDoor.w/2,
					z:-leftOpeningDoor.w/2+leftOpeningDoor.obj.position.z
				};
			}
			var updateCount=0;
			var leftOpeningDoorTween = new TWEEN.Tween(leftDoorAngle1).to(leftDoorAngle2, 1000).onUpdate(function(){
				if(updateCount==0){
					updateCount++;
					return;
				}
				var newRotation = new THREE.Euler( 0, (-leftDoorAngel.angle) * 0.017453292519943295, 0);
				doorItems.forEach(function(door){
					if(door.opening==='Left'){
                		door.obj.rotation.copy( newRotation );
                		var v=new THREE.Vector3(leftDoorAngel.x,0,leftDoorAngel.z);
                		door.obj.position.copy(v);
                		door.obj.updateMatrixWorld( true );

                	}
            	});

                updateBox(scope.obj);

			}).onComplete(function(){
				console.log('completed');
			}).easing(TWEEN.Easing.Quadratic.In).start();

			var rightDoorAngel={angle:179,x:0,z:rightOpeningDoor.obj.position.z};
			var updateCount=0;
			var rightOpeningDoorTween = new TWEEN.Tween(rightDoorAngel).to({
				angle:90,
				x:rightOpeningDoor.w/2,
				z:rightOpeningDoor.w/2+rightOpeningDoor.obj.position.z
			}, 1000).onUpdate(function(){
				if(updateCount==0){
					updateCount++;
					return;
				}
				var newRotation = new THREE.Euler( 0, (-rightDoorAngel.angle) * 0.017453292519943295, 0);
                doorItems.forEach(function(door){
					if(door.opening==='Right'){
                		door.obj.rotation.copy( newRotation );
                		var v=new THREE.Vector3(rightDoorAngel.x,0,rightDoorAngel.z);
                		door.obj.position.copy(v);
               	 		door.obj.updateMatrixWorld( true );
                	}
            	});

                updateBox(scope.obj);

			}).onComplete(function(){
				console.log('completed');
			}).easing(TWEEN.Easing.Quadratic.In).start();

			var rightDoorAngel={angle:179};
			var rightOpeningDoorTween = new TWEEN.Tween(rightDoorAngel).to({
				angle:90
			}, 1000);
			rightOpeningDoorTween.onUpdate(function(){
				var newRotation = new THREE.Euler( 0, (-rightDoorAngel.angle) * 0.017453292519943295, 0);
                rightOpeningDoor.obj.rotation.copy( newRotation );
                rightOpeningDoor.obj.updateMatrixWorld( true );
                updateBox(scope.obj);
			});
			rightOpeningDoorTween.onComplete(function(){
				console.log('completed');
			});
			rightOpeningDoorTween.easing(TWEEN.Easing.Quadratic.In);
			rightOpeningDoorTween.start();
			animate_OC();*/
		}else if(doorItems.length==1){
			var leftDoorAngel1={},leftDoorAngel2={};
			if(action==='open'){
				leftDoorAngel1={angle:1,x:0,z:doorItems[0].obj.position.z};
				leftDoorAngel2={
					angle:90,
					x:-doorItems[0].w/2,
					z:doorItems[0].w/2+doorItems[0].obj.position.z
				}
			}else{
				leftDoorAngel1={angle:90,x:doorItems[0].obj.position.x,z:doorItems[0].obj.position.z};
				leftDoorAngel2={
					angle:0,
					x:doorItems[0].Pos.x,
					z:doorItems[0].Pos.z
				}
			}
			var updateCount=0;
			var leftOpeningDoorTween = new TWEEN.Tween(leftDoorAngel1).to(leftDoorAngel2, 1000).onUpdate(function(){
				if(updateCount==0){
					updateCount++;
					return;
				}
				var newRotation = new THREE.Euler( 0, (-leftDoorAngel1.angle) * 0.017453292519943295, 0);
                doorItems[0].obj.rotation.copy( newRotation );
                var v=new THREE.Vector3(leftDoorAngel1.x,0,leftDoorAngel1.z);
                doorItems[0].obj.position.copy(v);
                doorItems[0].obj.updateMatrixWorld( true );
                updateBox(scope.obj);

			}).onComplete(function(){
			//	console.log('completed');
			}).easing(TWEEN.Easing.Quadratic.In).start();
			animate_OC();
		}
	};
	this.drawersAnimation=function(drawers,action){
		var scope=this;
		if(drawers.length>0){
			var allposition={};
			var initialPosition={};
			if(action==='open'){
			var box=new THREE.Box3().setFromObject(drawers[0].obj);
			var portion=box.getSize().z/drawers.length;
			portion=portion-0.005;
			drawers.forEach(function(d,index){
				allposition['position'+index]=(index+1)*portion;
				initialPosition['position'+index]=0;
			});
			}else{
				drawers.forEach(function(d,index){
					initialPosition['position'+index]=d.obj.position.z;
					allposition['position'+index]=0;
				});
			}
			var drawerTween = new TWEEN.Tween(initialPosition).to(
				allposition
			, 2000);
			drawerTween.onUpdate(function(){
				drawers.forEach(function(d,index){
					var zpos=0;
					if(action=='open'){
						zpos=initialPosition['position'+(drawers.length-1-index)];
					}else{
						zpos=initialPosition['position'+index];
					}
					var v=new THREE.Vector3(d.obj.position.x,d.obj.position.y,zpos);
                	d.obj.position.copy(v);
                	d.obj.updateMatrixWorld( true );
            	});
            	updateBox(scope.obj);
			});
			drawerTween.onComplete(function(){
				console.log('completed');
			});
			drawerTween.easing(TWEEN.Easing.Quadratic.In);
			drawerTween.start();
			animate_OC();
		}
	}
	this.stopAnimation=function(){
		var doorItems=[];
		var drawerItems=[];
		var shelfItems=[];
		this.childItems.forEach(function(child){
			if(child.itemType.indexOf('DoorFront')>-1){
				if(child.shape!=='IKEA.ART.00300918'){
					doorItems.push(child);
				}
			}else if( child.itemType==='Drawer'){
				drawerItems.push(child);
			}else if(child.itemType.indexOf('Shelf')>-1){
				shelfItems.push(child);
			}
		});
		if(doorItems.length>0)	{
			this.doorsAnimation(doorItems,'close');
		}

		//all drawers
		if(drawerItems.length>0){
			this.drawersAnimation(drawerItems,'close');
		}
	};
	this.playAnimation=function(){

		var doorItems=[];
		var drawerItems=[];
		var shelfItems=[];
		this.childItems.forEach(function(child){
			if(child.itemType.indexOf('DoorFront')>-1 || child.itemType.indexOf('Front800Up')>-1){

				if(child.shape!=='IKEA.ART.00300918'){
					doorItems.push(child);
				}
			}else if( child.itemType==='Drawer'){
				drawerItems.push(child);
			}else if(child.itemType.indexOf('Shelf')>-1){
				shelfItems.push(child);
			}
		});
		//all doors first
		if(doorItems.length>0)	{
			this.doorsAnimation(doorItems,'open');
		}

		//all drawers
		if(drawerItems.length>0){
			this.drawersAnimation(drawerItems,'open');
		}

	};
	this.collisionDetect = function(collArr) {

		var obj = this
		if(obj.geometry.boundingBox == undefined) obj.geometry.computeBoundingBox()
		var fBB =  new THREE.Box3().setFromObject(obj)

		var firstObj
		for(var j = 0; j<obj.userData[collArr].length;j++) {

			if(obj==obj.userData[collArr][j]) continue

			if(obj.userData[collArr][j].geometry.boundingBox == undefined) obj.userData[collArr][j].geometry.computeBoundingBox()
			var sBB =  new THREE.Box3().setFromObject(obj.userData[collArr][j])

			if(fBB.intersectsBox(sBB)) {
				this.matrixAutoUpdate=false

				return true

			}
		}
		this.matrixAutoUpdate=false

	return false
};
	init(this);
}
