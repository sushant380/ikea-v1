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
	if(parent instanceof THREE.Object3D){
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
			if(scope.rawChildItems && scope.rawChildItems.length){
				scope.rawChildItems.forEach(function(child){
					var childItem=new RoomItem(child,scope);
					scope.childItems.push(childItem)
				});
			}
			if(scope.lockXTranslation!=undefined) scope.obj.userData.lockXTranslation = scope.lockXTranslation
			if(scope.lockYTranslation!=undefined) scope.obj.userData.lockYTranslation = scope.lockYTranslation
			if(scope.lockZTranslation!=undefined) scope.obj.userData.lockZTranslation = scope.lockZTranslation
			
			if(scope.isHost){
				var v3=scope.itemsOffsetPos(scope,scope.obj.getWorldDirection());
				scope.obj.position.set(v3.x,v3.y,v3.z);
			}
			interactiveObjects.push(scope.obj);	
			if(parent)
				parent.add(scope.obj);
		});
	};
;	this.getItemObject=function(callback){
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
						
						/*var geo = new THREE.EdgesGeometry( object.children[0].geometry ); // or WireframeGeometry
						var mat = new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } );
						var wireframe = new THREE.LineSegments( geo, mat );
						var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ee00, wireframe: true, transparent: true } ); 
						object.add(wireframeMaterial);*/
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
	};
	this.doorsAnimation=function(doorItems){
		var scope=this;
		if(doorItems.lenght>1){
			var leftOpeningDoor=undefined;
			var rightOpeningDoor=undefined;
			doorItems.forEach(function(door){
				if(door.itemType.indexOf('DoorFrontA')>-1){
					leftOpeningDoor=door;
				}else if(door.itemType.indexOf('DoorFrontB')>-1){
					rightOpeningDoor=door;
				}
			});
			
			var leftDoorAngel={angle:1,x:0,z:leftOpeningDoor.obj.position.z};
			var updateCount=0;
			var leftOpeningDoorTween = new TWEEN.Tween(leftDoorAngel).to({
				angle:90,
				x:-leftOpeningDoor.w/2,
				z:leftOpeningDoor.w/2+leftOpeningDoor.obj.position.z
			}, 3000).onUpdate(function(){
				if(updateCount==0){
					updateCount++;
					return;
				}
				var newRotation = new THREE.Euler( 0, (-leftDoorAngel.angle) * 0.017453292519943295, 0);
                leftOpeningDoor.obj.rotation.copy( newRotation );
                var v=new THREE.Vector3(leftDoorAngel.x,0,leftDoorAngel.z);
                leftOpeningDoor.obj.position.copy(v);	
                leftOpeningDoor.obj.updateMatrixWorld( true );
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
			}, 3000).onUpdate(function(){
				if(updateCount==0){
					updateCount++;
					return;
				}
				var newRotation = new THREE.Euler( 0, (-rightDoorAngel.angle) * 0.017453292519943295, 0);
                rightOpeningDoor.obj.rotation.copy( newRotation );
                var v=new THREE.Vector3(rightDoorAngel.x,0,rightDoorAngel.z);
                rightOpeningDoor.obj.position.copy(v);	
                rightOpeningDoor.obj.updateMatrixWorld( true );
                updateBox(scope.obj);

			}).onComplete(function(){
				console.log('completed');
			}).easing(TWEEN.Easing.Quadratic.In).start();

			var rightDoorAngel={angle:179};
			var rightOpeningDoorTween = new TWEEN.Tween(rightDoorAngel).to({
				angle:90
			}, 3000);
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
			animate_OC();
		}else if(doorItems.length==1){
			var leftDoorAngel={angle:1,x:0,z:doorItems[0].obj.position.z};
			var updateCount=0;
			var leftOpeningDoorTween = new TWEEN.Tween(leftDoorAngel).to({
				angle:90,
				x:-doorItems[0].w/2,
				z:doorItems[0].w/2+doorItems[0].obj.position.z
			}, 3000).onUpdate(function(){
				if(updateCount==0){
					updateCount++;
					return;
				}
				var newRotation = new THREE.Euler( 0, (-leftDoorAngel.angle) * 0.017453292519943295, 0);
                doorItems[0].obj.rotation.copy( newRotation );
                var v=new THREE.Vector3(leftDoorAngel.x,0,leftDoorAngel.z);
                doorItems[0].obj.position.copy(v);	
                doorItems[0].obj.updateMatrixWorld( true );
                updateBox(scope.obj);

			}).onComplete(function(){
				console.log('completed');
			}).easing(TWEEN.Easing.Quadratic.In).start();
			animate_OC();
		}
	};
	this.drawersAnimation=function(drawers){
		var scope=this;
		if(drawers.length>1){
			var allposition={};
			var initialPosition={};
			var portion=drawers[0].d/drawers.length;
			drawers.forEach(function(d,index){
				allposition['position'+index]=index*portion;
				initialPosition['position'+index]=0;
			});
			console.log(allposition,initialPosition);
			var drawerTween = new TWEEN.Tween(initialPosition).to(
				allposition
			, 3000);
			drawerTween.onUpdate(function(){
				drawers.forEach(function(d,index){
					var v=new THREE.Vector3(d.obj.position.x,d.obj.position.y,initialPosition['position'+(drawers.length-1-index)]);
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
				allAnimationItems.push(child);
				doorItems.push(child);
			}else if( child.itemType==='Drawer'){
				drawerItems.push(child);
			}else if(child.itemType.indexOf('Shelf')>-1){
				shelfItems.push(child);
			}
		});
	};
	this.playAnimation=function(){
		var allAnimationItems=[];
		var doorItems=[];
		var drawerItems=[];
		var shelfItems=[];
		this.childItems.forEach(function(child){
			if(child.itemType.indexOf('DoorFront')>-1){
				allAnimationItems.push(child);
				doorItems.push(child);
			}else if( child.itemType==='Drawer'){
				drawerItems.push(child);
			}else if(child.itemType.indexOf('Shelf')>-1){
				shelfItems.push(child);
			}
		});
		//all doors first
		if(doorItems.length>0)	{	
			this.doorsAnimation(doorItems);
		}
		
		//all drawers 
		if(drawerItems.length>0){
			this.drawersAnimation(drawerItems);
		}

	};
	init(this);
}