"use strict";
var rItem;
var refItem;
function ROOMITEMS() {
this.scene,
this.items = [],
this.itemMeshes = [],
this.itemsOffsetPos,	// rpd data does not have pos based on object center
this.html='';
//this.collidableWalls = [],
//this.collidableFloor,
this.createItems = function() {

	//console.log(this.items)
		if(this.items==undefined) return
		for(var i=0;i<this.items.length;i++) {

		//console.log(this.items)
		var item = new ROOMITEM()
		//todo
		item.itemType = this.items[i].itemType
		item.w = this.items[i].width
		item.h = this.items[i].height
		item.d = this.items[i].depth

		item.w = this.items[i].w
		item.h = this.items[i].h
		item.d = this.items[i].d


		item.shape = this.items[i].shape

		item.Pos = this.items[i].Pos
		item.Ori = this.items[i].Ori
		item.name = this.items[i].name
		item.type = this.items[i].type
		item.color = this.items[i].color || 0xFFFFFF
		item.texture = this.items[i].texture
		item.material = this.items[i].material
		item.showWireframe = this.items[i].showWireframe
		item.childItems = this.items[i].childItems || []

		item.isVisibleFromOutside = true // assuming that all parent objects in the scene is VR visible

		item.defaultBoxItems()
		/*var parent=new THREE.Object3D();
		parent.isHost=true;*/
		item.isHost=true;
		rItem=new RoomItem(item,undefined,this);
		if(this.items[i].lockXTranslation!=undefined) item.obj.userData.lockXTranslation = this.items[i].lockXTranslation
		if(this.items[i].lockYTranslation!=undefined) item.obj.userData.lockYTranslation = this.items[i].lockYTranslation
		if(this.items[i].lockZTranslation!=undefined) item.obj.userData.lockZTranslation = this.items[i].lockZTranslation

		//
		//item.obj.userData.collidableWalls=this.collidableWalls
		//item.obj.userData.collidableWalls.push(this.collidableFloor)
		//
		item.obj.userData.collidablePostItems = this.itemMeshes // we should avoid placing objects on top of each other
		//




		if(this.itemsOffsetPos instanceof Function) { //exec post offsetPOS update
			var nPos = this.itemsOffsetPos(item, item.obj.getWorldDirection())
			item.setItemPosition(nPos)

//			console.log(item.obj.getWorldDirection())

		}

		//this.itemMeshes.push(item.obj)
		item.obj.onAfterRender = function(){this.matrixAutoUpdate=false} // solid object and don't recalc unless user action
		refItem=item.obj;
		this.html=this.html+this.getParentArticleHtml(item,i);
		//this.scene.add(item.obj)
		//this.scene.add(parent);
	}
},
this.getHtml=function(){
	return this.html;
}
this.getParentArticleHtml=function(itm,index){
	var target=''
	if(itm.shape && itm.shape.indexOf('.')!=-1){
			target=itm.shape.split('.').join('');
	}else{
		target='itmshape';
	}

	var html ='<div class="list-group-item" id="'+target+index+'"><div id="expander" data-target="#'+target+'Content'+index+'" data-toggle="collapse" data-group-id="'+target+index+'" data-role="expander"><ul class="list-inline"><li class="grandparentIcon">&gt;</li><li>'+itm.name+'('+itm.shape+')</li></ul></div><div class="collapse" id="'+target+'Content'+index+'" aria-expanded="true"> <table class="table"> <thead><tr><th>#</th><th>Article</th><th>Quantity</th></tr></thead><tbody>';
		var itemsCount=[];
		this.getChildRow(itm,itemsCount);
		var childItms='';
		var count=1;
		for(var key in itemsCount){
			childItms=childItms+'<tr data-toggle="collapse" data-target=".child'+count+'"><td>'+count+'</td><td>'+key+'</td><td>'+itemsCount[key]+'</td><tr>';
			count++;
		}
		html=html+childItms+'</tr> </tbody> </table> </div></div>'
		return html;
}

this.getChildRow=function(itm,itemsArray){
	if(itm.childItems!=undefined && itm.childItems.length){
		for(var i=0;i<itm.childItems.length;i++){
			itemsArray[itm.childItems[i].shape]=itemsArray[itm.childItems[i].shape]!=undefined? itemsArray[itm.childItems[i].shape]+1:1;
			if(itm.childItems[i].childItems!=undefined && itm.childItems[i].childItems.length){
				this.getChildRow(itm.childItems[i],itemsArray);
			}
		}
	}else{
		itemsArray[itm.shape]=itemsArray[itm.shape]!=undefined? itemsArray[itm.shape]+1:1;
	}
}
this.init = function() {
	this.createItems()
	//console.log(this.itemMeshes)


}
};

function ROOMITEM() {
this.itemType,
this.selectable = false,	// not used
this.allowTranslation = false, // not used

this.lockXTranslation = false,
this.lockYTranslation = false,
this.lockZTranslation = false,

this.allowScale = false,	// not used yet
this.allowRotation = false, // not used yet
this.translationDirections = new THREE.Vector3(), // 1 should mark direction item is  movable in
this.snappableObjects = [],	//array with objects it can snapp against?
this.w,	//width
this.h, //height
this.d,	//depth
this.childItems = [],	//store this items childs
this.obj,
this.shape,
this.Pos = new THREE.Vector3(0,0,0),
this.Ori = new THREE.Vector3(0,0,0),
this.color = 0xFFFFFF,
this.texture,
this.material,
//this.collidableWalls = [],
this.isVisibleFromOutside, //include in VR export
this.showWireframe,

this.defaultBoxItems = function () {
	var x=this.Pos.x;
	this.defaultChildBoxItems()
	// temp adding all obj to interactive obj
	//interactiveObjects.push(this.obj)
	// adding collisionDetect

	this.obj.userData.itemType=this.itemType
	this.obj.collisionDetect = this.collisionDetect
	this.obj.userData.isVisibleFromOutside = this.isVisibleFromOutside


	this.obj.name=this.name


},

this.testLoadingRealObj = function(scope, parentScope, modelname) {

	var loader = new THREE.OBJLoader();
				loader.setPath( 'models/obj/' );
				loader.load( modelname, function ( object ) {

				if(object instanceof THREE.Group) {

					scope.defaultChildBoxItems(parentScope,object.children[0], 1)

				}
				else if(object instanceof THREE.Object3D) {

					scope.defaultChildBoxItems(parentScope,object, 2)

					render()

				}

				} );
},


this.getGeometry = function(scope, parentScope) {
	var mesh_geo

	if(scope.itemType == "DrawerHandle" || scope.itemType == "DoorHandleA" || scope.itemType == "DoorHandleB") scope.testLoadingRealObj(scope, parentScope,'handle.obj')
	else if(scope.itemType == "DrawerFront" && scope.w==0.5970 && scope.h==0.2) scope.testLoadingRealObj(scope, parentScope,'Front60x20.obj')
	else if(scope.itemType == "Drawer" && scope.w==0.5970) scope.testLoadingRealObj(scope, parentScope,'maximera.obj')
//	else if(scope.itemType == "Frame" && scope.shape) scope.testLoadingRealObj(scope, parentScope,scope.shape+'.obj')
	else mesh_geo = new THREE.BoxGeometry(scope.w, scope.h, scope.d);
	return mesh_geo
}

this.defaultChildBoxItems = function (parentScope, model , trace) {
	//Create main objectpar

	var mesh_geo
	//test handle load

	var mesh = model

	// no OBJ has been loaded yet...
	if(model==undefined) {

		 mesh_geo = this.getGeometry(this, parentScope)


		if(mesh_geo==undefined) return

		var mesh_mat
		if(this.material!=undefined) mesh_mat = mProx.getMaterial({"material":this.material,"color":this.color});
		else if(this.texture!=undefined) {
			mesh_mat = mProx.getMaterial({"texture":this.texture,"color":this.color});
		}
		else if(this.name.indexOf('Obstacle')){
			mesh_mat = new THREE.MeshLambertMaterial({color : this.color, transparent: false, opacity: 1});
		}
		else  {
			mesh_mat = new THREE.MeshLambertMaterial({color : this.color, transparent: true, opacity: 0.9});
		}

	var mesh = new THREE.Mesh(mesh_geo, mesh_mat);
	}
	//

	mesh.castShadow = true
	mesh.recieveShadow = true

	// wireframe
	if(this.showWireframe ) {
		var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
		var mat = new THREE.LineBasicMaterial( { color: 0xaaaaaa, linewidth: 2 } );
		var wireframe = new THREE.LineSegments( geo, mat );
		mesh.add(wireframe)
	}

	this.obj = mesh
	//console.log(this.obj)

	//this.obj.geometry.computeFaceNormals()
	//this.obj.geometry.computeVertexNormals()


	this.obj.position.set(this.Pos.x, this.Pos.y, this.Pos.z)
	// set correct rotation
	this.obj.rotation.set(this.Ori.x, this.Ori.y, this.Ori.z)

	this.obj.name=this.itemType
	this.obj.userData.itemType=this.itemType
	this.obj.userData.isVisibleFromOutside = this.isVisibleFromOutside


	// add childs

	for(var i=0;i<this.childItems.length;i++) {
		if(this.childItems[i].shape==undefined) continue
		var item = new ROOMITEM()

		item.w = this.childItems[i].w
		item.h = this.childItems[i].h
		item.d = this.childItems[i].d

		item.shape = this.childItems[i].shape

//		console.log(item)
//		console.log(this.childItems[i].Pos)

//		console.log(this.obj)
		item.Pos = this.childItems[i].Pos
		item.Ori = this.childItems[i].Ori

		item.color = this.childItems[i].color
		item.texture = this.childItems[i].texture
		item.material = this.childItems[i].material
		item.childItems = this.childItems[i].childItems
		item.isVisibleFromOutside = this.childItems[i].isVisibleFromOutside
		item.itemType = this.childItems[i].itemType
		item.name = this.childItems[i].name
		item.showWireframe = this.childItems[i].showWireframe


		item.defaultChildBoxItems(this)

		if(item.obj!=undefined) {
			this.obj.add(item.obj)

		this.obj.onAfterRender = function(){this.matrixAutoUpdate=false} // solid object and don't recalc unless user action

		// helper to trace direction...
		item.getItemDirection()
		}


//		item.Pos = v3.addVectors(this.obj.getWorldDirection(), item.Pos)


		}
			if(parentScope!=undefined && parentScope.obj instanceof THREE.Object3D) {


			this.obj.onAfterRender = function(){this.matrixAutoUpdate=false}
			parentScope.obj.add(this.obj)

		}

},

this.setItemPosition = function(v3) {
	this.obj.position.set(v3.x,v3.y,v3.z)
},

this.getItemDirection = function() {	//so we know in which direction front is

		//this.obj.rotation.set(2,0,1)
		//this.obj.updateMatrix()

	var matrix = new THREE.Matrix4();
	matrix.extractRotation( this.obj.matrix );

	var direction = new THREE.Vector3( 0, 0, 1 );
	var dir = direction.applyMatrix4( matrix )//matrix.multiplyVector3( direction );


	// direction debug
//	if(this.obj.getWorldDirection().x==0 ) { //&& this.obj.getWorldDirection().x==0 ) {
	var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 1 } );
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),dir)
	var line = new THREE.Line( geometry ,mat);
	//console.log(line)
//	this.obj.add( line );
//	}


	this.direction = dir



//	console.log(this.name)
//	console.log(dir)
},

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
}

}
