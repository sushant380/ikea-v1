

function ROOMBASE() {
this.commonHelper = new HELPERS(),
this.currentScene,
this.convertedRPD,
this.shapeAxis = {x:"x",y:"y"}, // describes which axis to use to understand floor shape
this.wallThickness = 0.2, // setting default
this.ceilingHeight, //to do
this.roomPoints,
this.openingsArr = [],
this.isMetric,
this.roomShape,
this.floorShape,
this.wallsShape,
this.platform,
this.allWallMeshes = [],
this.textureLoader = new THREE.TextureLoader(),
this.vertexHelpers=[];
this.planeView=undefined;
 this.intersectObjects=[];
this.textureOnLoaded = function(texture) {
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

	// call rerender once the texture is loaded
	renderer.domElement.dispatchEvent(new Event('rerender'));

	return texture
},
this.setTexture = function(shape, t, c) {

/**	var texture = this.textureLoader.load(t, this.textureOnLoaded )
	var mat = new THREE.MeshLambertMaterial( { // new THREE.MeshBasicMaterial({
                     color: 0xffffff,
					 map:texture,
					 side:THREE.DoubleSide
					 //wireframe:true,

                 });
	//shape.material = mat;
	**/
	shape.material = mProx.getMaterial({"texture":t,"color":c});

},

this.getRoomPoints = function() {
	var v2a = new Array()
	for(var i=0; i<this.roomPoints.length;i++) {
		//console.log(this.shapeAxis.x + " " + this.shapeAxis.y)
		v2a.push(new THREE.Vector2( this.roomPoints[i][this.shapeAxis.x], this.roomPoints[i][this.shapeAxis.y] ))
	}
	//console.log(v2a)
	return v2a //
},

this.setRoomShape = function() {

	var squareShape = new THREE.Shape();
	squareShape.autoClose=true
	var roomPoints = this.getRoomPoints();
	for(var i = 0; i<roomPoints.length;i++) {

		if(i==0) squareShape.moveTo( roomPoints[i].x,roomPoints[i].y );
		else squareShape.lineTo( roomPoints[i].x, roomPoints[i].y );

		}
		//console.log("squareShape")
		//console.log(squareShape)
	this.roomShape = squareShape
},
this.createCommonWallShape = function(p1,p2) {

		var wallPs = new Array()
		var p3,p4
		var wallThickness = this.wallThickness

		// create wall thickness
		var a = this.commonHelper.angle(p1.x, p1.y, p2.x, p2.y)
		p3 = this.commonHelper.findNewPoint(p1.x, p1.y, a + (90 * (Math.PI/180) ),  wallThickness)
		p4 = this.commonHelper.findNewPoint(p2.x, p2.y, a + (90 * (Math.PI/180) ),  wallThickness)

		wallPs.push(p1)
		wallPs.push(p2)
		wallPs.push(p4) //p4
		wallPs.push(p3) //p3
		return wallPs

}
this.roomWallShapesInner = function() {

	var roomPoints = this.getRoomPoints();

	var wallsArr = new Array()
	var p1,p2;
  var mat = new THREE.MeshPhongMaterial({
   color: 0xFFFFFF,
   emissive: new THREE.Color(0x656464),
   shininess: 0,
   side: THREE.DoubleSide
  });
	for(var i = 0; i<roomPoints.length;i++) {
		p1 = roomPoints[i]
		if(i<roomPoints.length-1) p2 = roomPoints[i+1]
		else p2 = roomPoints[0]

		wallsArr.push(this.createCommonWallShape(p1,p2))

		}


	// change outer wall lines so that they join nicer
	for(var i = 0; i<wallsArr.length;i++) {

		var NL
		if(i<wallsArr.length-1) NL = i+1
		else NL = 0

		var intPoint = this.commonHelper.checkLineIntersection(wallsArr[i][3]["x"], wallsArr[i][3]["y"], wallsArr[i][2]["x"], wallsArr[i][2]["y"], wallsArr[NL][2]["x"], wallsArr[NL][2]["y"], wallsArr[NL][3]["x"], wallsArr[NL][3]["y"])

		if(intPoint.x != null) {
			////console.log("adjusted corner")
			wallsArr[i][2]["x"] = wallsArr[NL][3]["x"] = intPoint["x"]
			wallsArr[i][2]["y"] = wallsArr[NL][3]["y"] = intPoint["y"]
		}

		if(i==0) { //handle joint if also the last one.
			NL = wallsArr.length-1
			var intPoint = this.commonHelper.checkLineIntersection(wallsArr[i][2]["x"], wallsArr[i][2]["y"], wallsArr[i][3]["x"], wallsArr[i][3]["y"], wallsArr[NL][2]["x"], wallsArr[NL][2]["y"], wallsArr[NL][3]["x"], wallsArr[NL][3]["y"])
			////console.log("check last")
			////console.log(intPoint)
			wallsArr[i][3]["x"] = wallsArr[NL][3]["x"] = intPoint["x"]
			wallsArr[i][3]["y"] = wallsArr[NL][3]["y"] = intPoint["y"]
		}

		var squareShape = new THREE.Shape();


		for(var j = 0; j<wallsArr[i].length;j++) {

			if(j==0) {
				squareShape.moveTo( wallsArr[i][j]["x"],wallsArr[i][j]["y"] );
				//store the start point
			}
			else if(j==1) {
				//store the second point
				squareShape.lineTo( wallsArr[i][j]["x"], wallsArr[i][j]["y"] );
			}
			else squareShape.lineTo( wallsArr[i][j]["x"], wallsArr[i][j]["y"] );

		}

		//
		var extrudeSettingsWalls = {amount: parseFloat(this.ceilingHeight), bevelEnabled: false };
		//
	    var geometryWall = new THREE.ExtrudeGeometry( squareShape, extrudeSettingsWalls );




	    var wallgeo =new THREE.Geometry();
		wallgeo.vertices=geometryWall.vertices;
		wallgeo.faces=geometryWall.faces;
		var wallInner = new THREE.Mesh( geometryWall,mat);
		//wallInner.receiveShadow = true;
		wallInner.receiveShadow  = true;
		wallInner.userData = {"wallBaseShape": wallsArr[i]}
		wallInner.name = "Wall"+i

		//var t = "materials/texture/White.jpg"
		var t = "White.jpg"
		//this.setTexture(wallInner, t)
		//this.addWireFrameLines(wallInner,wallInner)

		//wallInner.rotation.set(-Math.PI/2,0,0)

		this.correctMaxtrixAfterChanges(wallInner)
		//this.recalcSphereBB(wallInner) //remove?
		//console.log(wallInner)

		this.allWallMeshes.push(wallInner)


		var matrix = new THREE.Matrix4();
		wallInner.updateMatrix()
/**		matrix.extractRotation(wallInner.matrix);

	var direction = new THREE.Vector3( 0, 0,1 );
	var dir = direction.applyMatrix4( matrix )//matrix.multiplyVector3( direction );


	// direction debug
	//if(this.obj.getWorldDirection().x==0 ) { //&& this.obj.getWorldDirection().x==0 ) {
	var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 1 } );
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ),dir)
	var line = new THREE.Line( geometry ,mat);
	//console.log(line)
	wallInner.add( line );
	**/
	//


//	console.log(wallInnersss)
		//


	}
},

this.addWireFrameLines = function(obj, attachToObj) {
	var geo = new THREE.EdgesGeometry( obj.geometry )// or WireframeGeometry
	var mat = new THREE.LineBasicMaterial( { color: 0xdddddd, linewidth: 0.1 } );
	var wireframe = new THREE.LineSegments( geo, mat );
	attachToObj.add( wireframe );
}

this.correctMaxtrixAfterChanges = function(obj) {
/**	obj.updateMatrix();
	obj.geometry.applyMatrix( obj.matrix );
	obj.matrix.identity();

//	obj.position.set( 0, 0, 0 );
//	obj.rotation.set( 0, 0, 0 );
//	obj.scale.set( 1, 1, 1 );
	obj.geometry.computeBoundingBox()
	obj.geometry.computeBoundingSphere();
	//obj.geometry.mergeVertices();
	obj.geometry.computeFaceNormals();
	obj.geometry.computeVertexNormals(); **/
		obj.geometry.computeFaceNormals();
	obj.geometry.computeVertexNormals()
	obj.geometry.computeBoundingBox()
		obj.geometry.computeBoundingSphere();
}
this.setFloor = function() {
	var geometry = new THREE.ShapeGeometry( this.roomShape );
	this.floorShape = new THREE.Mesh( geometry );
	this.floorShape.receiveShadow = true;
	//this.floorShape.castShadow = true;
//	this.floorShape.rotation.x = -Math.PI /2
	this.correctMaxtrixAfterChanges(this.floorShape)

//	this.floorShape.rotation.set(-Math.PI /2, 0,0)

	this.floorShape.name ="floor"

	// create texture and material
	var map=new THREE.TextureLoader().load( "img/wood.jpg" ),
		displacementMap=new THREE.TextureLoader().load( "img/floor/Bathroom-Floor-Tile-Texture-1024x1024_DISP.png" ),
		normalMap=new THREE.TextureLoader().load( "img/floor/Bathroom-Floor-Tile-Texture-1024x1024_NRM.png" ),
		aoMap=new THREE.TextureLoader().load( "img/floor/Bathroom-Floor-Tile-Texture-1024x1024_OCC.png" ),
		specularMap=new THREE.TextureLoader().load( "img/floor/Bathroom-Floor-Tile-Texture-1024x1024_SPEC.png" );

		map.wrapS=map.wrapT=THREE.RepeatWrapping;
		displacementMap.wrapS=displacementMap.wrapT=THREE.RepeatWrapping;
		normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;
		aoMap.wrapS=aoMap.wrapT=THREE.RepeatWrapping;
		specularMap.wrapS=specularMap.wrapT=THREE.RepeatWrapping;
	var floorTexture=new THREE.MeshPhongMaterial({
		map:map
	});

	this.floorShape.material=floorTexture;


},

this.setAllOpenings = function() {
	for(var i=0; i<this.openingsArr.length;i++) {
		this.setOpening2(this.openingsArr[i])
	}
},

this.checkIntersection = function(f, t, objArr) {
					var raycaster = new THREE.Raycaster(t, f);
					var collisionResults = raycaster.intersectObjects(objArr);
					return collisionResults
},

this.setOpening2 = function(openingObj) {
//		console.log("into setOpening2")
//		console.log(openingObj)
		var pnt =  new THREE.Vector2(openingObj.Pos.x, openingObj.Pos.z)

//		console.log(openingObj.Pos.x + " " +openingObj.Pos.y+ " " + openingObj.Pos.z)

		var gBB =  new THREE.SphereGeometry( this.wallThickness/2, 4, 4 );
		var materialbSB = new THREE.MeshBasicMaterial( {color: 0x000000} );
		var gBB_M = new THREE.Mesh( gBB,materialbSB );
		gBB_M.position.set(openingObj.Pos.x,openingObj.Pos.z, openingObj.Pos.y)

		//scene.add(gBB_M)

		this.recalcSphereBB(gBB_M)
		var fBB =  new THREE.Box3().setFromObject(gBB_M)
		//	scene.add(gBB_M) // show test pooint

		var firstObj
		for(var j = 0; j<this.allWallMeshes.length;j++) {
			var sBB =  new THREE.Box3().setFromObject(this.allWallMeshes[j])

			if(fBB.intersectsBox(sBB)) {
//			console.log("intersection check")
			firstObj = this.allWallMeshes[j]
			break

			}
		}
//		console.log("firstObj")
		if(firstObj!=undefined) {
		var firstObjUD = firstObj.userData.wallBaseShape
//		console.log(firstObjUD)
		var l1 = firstObjUD[0]
		var l2 = firstObjUD[1]
		//console.log(firstObjUD)

		var la = this.commonHelper.angle(l1.x, l1.y ,l2.x, l2.y)
		//console.log(la)

		var pLeft = this.commonHelper.findNewPoint(pnt.x, pnt.y, la,  (openingObj.PosLeft))
		var pRight = this.commonHelper.findNewPoint(pnt.x, pnt.y, la,  (openingObj.PosRight))


		var openingPoints = this.createCommonWallShape(pLeft,pRight)

		var openingShape = new THREE.Shape();

		for(var j = 0; j<openingPoints.length;j++) {
			//console.log(openingPoints[j]["x"] + " "+openingPoints[j]["y"])
			if(j==0) openingShape.moveTo( openingPoints[j]["x"],openingPoints[j]["y"] );
			else openingShape.lineTo( openingPoints[j]["x"], openingPoints[j]["y"] );

		}
			//console.log(openingShape)
			var d
			if(openingObj.PosBottom != undefined) d= parseFloat(openingObj.PosTop - openingObj.PosBottom)
			else {
				d= openingObj.PosTop
				openingObj.PosBottom = 0
			}

			//console.log(d)

			var extrudeSettingsOpening = { amount: d, bevelEnabled: false };

			//
			var geometryOpening = new THREE.ExtrudeGeometry( openingShape, extrudeSettingsOpening );

			var wallgeo=new THREE.Geometry();
			wallgeo.vertices=geometryOpening.vertices;
			wallgeo.faces=geometryOpening.faces;
			var openingMesh = new THREE.Mesh( wallgeo);

			openingMesh.name = "Opening"
			var c =  openingObj.PosBottom// this.ceilingHeight//- openingObj.PosTop - (d/2)
			openingMesh.position.z= c
			var openingMesh2 = new THREE.Mesh( geometryOpening)
			openingMesh.position.z= c

			//this.correctMaxtrixAfterChanges(openingMesh)
			var removePart = new ThreeBSP( openingMesh);
			var remainPart = new ThreeBSP( firstObj);

			var subtract_bsp = remainPart.subtract(removePart);
			var result =  subtract_bsp.toMesh()



			//result.material =  firstObj.material
			//result.name = firstObj.name
			//result.userData = firstObj.userData

			// create opening mesh with transparent and WF
			var material2 = new THREE.MeshLambertMaterial({color: 0x9999FF, transparent: true, opacity: 0.1});
			openingMesh.material = material2
			this.addWireFrameLines(openingMesh,openingMesh)
			firstObj.geometry = result.geometry

			//openingMesh.receiveShadow = true;
			//openingMesh.castShadow = true;
			firstObj.add(openingMesh)
//scene.add(openingMesh)
		}
},

this.recalcSphereBB = function(obj) {
		obj.geometry.computeBoundingBox()
		obj.geometry.computeBoundingSphere();

		// since the computation of the wall segments fails for some reaons, I use the floor shapes bonding sphere instead and mltiplu the radius with 2
		obj.geometry.boundingSphere = this.floorShape.geometry.boundingSphere
		obj.geometry.boundingSphere.radius = obj.geometry.boundingSphere.radius *10 // TODO, fix better sphere calc...
},
this.setAllWallsToScene = function() {
	for(var i = 0; i<this.allWallMeshes.length;i++) {


		//this.correctMaxtrixAfterChanges(this.allWallMeshes[i])
		//this.allWallMeshes[i].rotation.set(-Math.PI /2,0,0)

		scene.add(this.allWallMeshes[i])
		this.recalcSphereBB(this.allWallMeshes[i]) // to make sure the raytrace works

		}
},
this.drawUshapePlatform=function(color){
	var eastWall=this.allWallMeshes[0];
	 var wallWidth=new THREE.Box3().setFromObject(eastWall).getSize().x;
	 var shapeWidth=wallWidth-0.1;var texture=THREE.ImageUtils.loadTexture("img/"+color+".jpg");
	var image=new THREE.MeshLambertMaterial({ map: texture });
	texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
	texture.repeat.set(3,3);
	 var iShape=new THREE.BoxGeometry(shapeWidth,0.6,0.03);
	 //var material1 = new THREE.MeshBasicMaterial( { color: color, overdraw: 0.5 } );
	 var cube1 = new THREE.Mesh( iShape, image );
	 cube1.rotation.set(1.56558,0,0);
	cube1.position.set(0,0.884,-1.95);

	var northWall=this.allWallMeshes[3];
	var nwallWidth=new THREE.Box3().setFromObject(northWall).getSize().z;
	var nshapeWidth=nwallWidth-0.1;
	var nShape=new THREE.BoxGeometry(nshapeWidth,0.6,0.03);
	//var material2 = new THREE.MeshBasicMaterial( { color: color, overdraw: 0.5 } );
	var cube2 = new THREE.Mesh( nShape, image );
	cube2.rotation.set(1.56558,0,1.56558);
	cube2.position.set(-2.7,0.884,0);
	var southWall=this.allWallMeshes[3];
	var swallWidth=new THREE.Box3().setFromObject(southWall).getSize().z;
	var sshapeWidth=swallWidth-0.1;
	var sShape=new THREE.BoxGeometry(sshapeWidth,0.6,0.03);
	//var material3 = new THREE.MeshBasicMaterial( { color: color, overdraw: 0.5 } );
	var cube3 = new THREE.Mesh( sShape, image );
	cube3.rotation.set(1.56558,0,1.56558);
	cube3.position.set(2.7,0.884,0);
	 var center=new ThreeBSP(cube1);
	 var left= new ThreeBSP(cube2);
	 var right= new ThreeBSP(cube3);
	 var unionTop=center.union(left).union(right);
	var result = unionTop.toMesh( cube1.material);
	 result.geometry.computeVertexNormals();
	if(!this.platform){
		this.platform=result;
		scene.add(this.platform,this.plane());
		this.intersectObjects.push(this.platform);
	}else{
		this.platform.geometry=result.geometry;
	}
	//interactiveObjects.push(this.platform);
	this.createVertexHelper();

};
this.drawLshapePlatform=function(color){
	 var eastWall=this.allWallMeshes[0];
	 var wallWidth=new THREE.Box3().setFromObject(eastWall).getSize().x;
	 var texture=THREE.ImageUtils.loadTexture("img/"+color+".jpg");
	var image=new THREE.MeshLambertMaterial({ map: texture });
	texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
	texture.repeat.set(3,3);
	 var shapeWidth=wallWidth-0.1;
	 var iShape=new THREE.BoxGeometry(shapeWidth,0.6,0.03);
	 //var material1 = new THREE.MeshBasicMaterial( { color: color, overdraw: 0.5 } );
	 var cube1 = new THREE.Mesh( iShape, image );
	 cube1.rotation.set(1.56558,0,0);
	 cube1.position.set(0,0.884,-1.95);

	var northWall=this.allWallMeshes[3];
	var nwallWidth=new THREE.Box3().setFromObject(northWall).getSize().z;
	var nshapeWidth=nwallWidth-0.1;
	var nShape=new THREE.BoxGeometry(nshapeWidth,0.6,0.03);
	//var material2 = new THREE.MeshBasicMaterial( { color: color, overdraw: 0.5 } );
	var cube2 = new THREE.Mesh( nShape, image );
	cube2.rotation.set(1.56558,0,1.56558);
	cube2.position.set(-2.7,0.884,0);
	 var center=new ThreeBSP(cube1);
	 var left= new ThreeBSP(cube2);
	 var unionTop=center.union(left);
	 var result = unionTop.toMesh( cube1.material);
	 result.geometry.computeVertexNormals();

	if(!this.platform){
		this.platform=result;
		scene.add(this.platform,this.plane());
		 this.intersectObjects.push(this.platform);
	}else{
		this.platform.geometry=result.geometry;
	}

///interactiveObjects.push(this.platform);
this.createVertexHelper();

}
this.plane=function(){
	if(!this.planeView){
	  this.planeView=new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2,2,2,1,1,1),
        new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide})
        );
	}
	  return this.planeView;
}
this.createVertexHelper=function(){
	var sphere=new THREE.Mesh(
        new THREE.SphereGeometry(0.01,0.01,0.01),
        new THREE.MeshBasicMaterial({color:0x000000})
        );
	 for(var i=0;i<this.platform.geometry.vertices.length;i++){
        var vertexHelper=sphere.clone();
        var vertexPosition=this.platform.geometry.vertices[i];
        vertexHelper.position.copy(vertexPosition);
        vertexHelper.visible=false;
        vertexHelper.data={index:i};
        scene.add(vertexHelper);
        this.vertexHelpers.push(vertexHelper);
        this.intersectObjects.push(vertexHelper);
    }
}
this.removeWorkTop=function(cube,item){
	if(item.name==='CabWorktop' || (item.parent && item.parent.name==='CabWorktop')){

		if(item.name==='CabWorktop' ){
			if(item.material.materials){
				for(var w=0;w<item.material.materials.length;w++){
					item.material.materials[w].transparent=true;
					item.material.materials[w].opacity=0;
				}
			}
			item.material.transparent=true;
			item.material.opacity=0;
		}
		var cabworkTop=new ThreeBSP(cube);
		var childShape=undefined;
		if(item.name==='CabSink' || item.name==='CabHob'){
			var box=new THREE.Box3().setFromObject(item);
			var anothercube = new THREE.Mesh( new THREE.CubeGeometry( box.getSize().x-0.01, box.getSize().y, box.getSize().z-0.01 ), new THREE.MeshNormalMaterial() );
			scene.updateMatrixWorld();
			var vector = new THREE.Vector3();
			vector.setFromMatrixPosition( item.matrixWorld );
			anothercube.position.copy(vector);
			console.log(vector);

			childShape=new ThreeBSP(anothercube);
			var subtractTop=cabworkTop.subtract(childShape);
			var result = subtractTop.toMesh( cabworkTop.material);
			result.geometry.computeFaceNormals();
			result.geometry.computeVertexNormals();
			cube.geometry=result.geometry;
			//scene.add(result);

		}

		/*else{
			if(item.geometry instanceof THREE.BufferGeometry){
				childShape = new ThreeBSP(new THREE.Geometry().fromBufferGeometry( item.geometry));
			}else{
				childShape=new ThreeBSP(item);
			}
		}*/


		if(item.children && item.children.length>0){
			for(var h=0;h<item.children.length;h++){
				this.removeWorkTop(cube,item.children[h]);
			}
		}

	}else{
		if(item.children && item.children.length>0){
			for(var h=0;h<item.children.length;h++){
				this.removeWorkTop(cube,item.children[h]);
			}
		}
	}
}
this.addWorktop=function(top,item){
	if(item.name==='CabWorktop'){
		var box=new THREE.Box3().setFromObject(item);
		var cubeGeometry=new THREE.CubeGeometry(box.getSize().x,box.getSize().y,box.getSize().z);
		var cube = new THREE.Mesh( cubeGeometry, item.material );
		cube.position.copy(item.position);
		if(top){
			var topG=new ThreeBSP(top);
			var addC=new ThreeBSP(cube);
			var un=topG.union(addC);
			var result = un.toMesh( top.material);
			result.geometry.computeVertexNormals();
			top.geometry=result.geometry;
		}else{
			top=item.clone();
		}
	}else{
		if(item.children && item.children.length>0){
			for(var j=0;j<item.children.length;j++){
				this.addWorktop(top,item.children[j]);
			}
		}
	}
}
this.drawPlatform=function(){
	//var material = new THREE.MeshBasicMaterial( { color: "#ff00000", overdraw: 0.5 } );
	var top=new THREE.Object3D();
	scene.updateMatrixWorld();
	for(var k=0;k<myRoomItems.itemMeshes.length;k++){
		var box=new THREE.Box3().setFromObject(myRoomItems.itemMeshes[k]);
		var cube =new THREE.CubeGeometry(box.getSize().x,box.getSize().y,box.getSize().z);
		var cubeMesh=new THREE.Mesh(cube,myRoomItems.itemMeshes[k].material);
		cubeMesh.position.setFromMatrixPosition(myRoomItems.itemMeshes[k].matrixWorld);
		top.add(cubeMesh);
	}
	var hex  = 0xff0000;
	var bbox = new THREE.EdgesHelper( top.geometry, hex );
	bbox.update();
	bbox.position.set(0,0,0);
	scene.add( bbox );

}
this.drawIshapePlatform=function(color){
	if(this.platform){
		scene.remove(this.platform);
		this.platform=undefined;
	}
	var baseCabinets=[];
var baseTop=new THREE.Object3D();
	var baseMesh=null;
	var cabIndex=0;
	var worktopVector=new THREE.Vector3(0,0,0);
	var texture=THREE.ImageUtils.loadTexture("img/"+color+".jpg");
	var image=new THREE.MeshLambertMaterial({ map: texture });
	texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
	texture.repeat.set(2,2);
	var modifer = new THREE.SimplifyModifier();
	myRoomItems.itemMeshes.forEach(function(itm,index){
		if(itm.name.indexOf('Base')>-1){
			itm.children.forEach(function(chld){
				if(chld.name.indexOf('CabWorktop')>-1){
					var worktop=chld.clone();
					worktop.children=[];
					itm.geometry.computeBoundingBox();
					worktop.geometry.computeBoundingBox();

					var iShape=new THREE.BoxGeometry(itm.geometry.boundingBox.getSize().x+0.06,worktop.geometry.boundingBox.getSize().y,0.675000011920929);

					var cube = new THREE.Mesh( iShape, image );
					itm.updateMatrixWorld();
					var actualPosition=new THREE.Vector3();
					actualPosition.setFromMatrixPosition(worktop.matrixWorld);
					cube.position.copy(actualPosition);
					if(itm.name==='IKEA.Host.Basecabinet_corner_127'){

						if(itm.rotation.y>0){
							cube.position.z=cube.position.z-0.33;
						}
						if(itm.rotation.y<0){
							cube.position.z=cube.position.z+0.33;
						}
						//cube.position.x=0
					}
					cube.rotation.copy(itm.rotation);
					if(cabIndex==0){
						baseMesh=cube;
						cabIndex++;
					}else{
						var base=new ThreeBSP(baseMesh);
						var cubeMesh=new ThreeBSP(cube);
						var result=base.union(cubeMesh);
						baseMesh=result.toMesh(base.material);
						baseMesh.geometry.computeFaceNormals();
						baseMesh.geometry.computeVertexNormals();
						//cube.updateMatrix();
						//baseMesh.geometry.merge(cube.geometry,cube.matrix);
					}
					//baseTop.add(cube);
				}
			});
		}
	});
	baseMesh.geometry.computeBoundingBox();
	scene.children.forEach(function(obts){
		if(obts.name.indexOf('Obstacle')>-1){
			obts.geometry.computeBoundingBox();
			var iShape=new THREE.BoxGeometry(obts.geometry.boundingBox.getSize().x+0.06,baseMesh.geometry.boundingBox.getSize().y,0.675000011920929);
			var cube = new THREE.Mesh( iShape, image );
			//obts.updateMatrixWorld();
			var actualPosition=new THREE.Vector3();
			actualPosition.setFromMatrixPosition(obts.matrixWorld);
			cube.position.copy(obts.position);
			cube.position.y=baseMesh.position.y;
			cube.position.z=baseMesh.position.z-obts.geometry.boundingBox.getSize().z-0.034;
			var newCube=new ThreeBSP(cube);
			var obstacle=new ThreeBSP(obts);
			var rs=newCube.subtract(obstacle);
			var base=new ThreeBSP(baseMesh);
			var cubeMesh=new ThreeBSP(rs.toMesh(base.material));
			var result=base.union(cubeMesh);
			baseMesh=result.toMesh(base.material);
		}
	});

	baseMesh.material=image;
	for(var k=0;k<myRoomItems.itemMeshes.length;k++){
		this.removeWorkTop(baseMesh,myRoomItems.itemMeshes[k]);
	}
	baseMesh.geometry.mergeVertices();


	/*var edges=new THREE.EdgesGeometry(worktopMesh.geometry);
	var edesLine=new THREE.LineSegments(edges,new THREE.MeshBasicMaterial({color:'#ff00000'}));
	scene.add(edesLine);*/
	if(!this.platform){
		this.platform=baseMesh;
		scene.add(this.platform);
		this.intersectObjects.push(this.platform);
	}else{
		this.platform.geometry=baseMesh.geometry;
	}
	var itemsPositions=[];
	for(var p=0;p<myRoomItems.itemMeshes.length;p++){
		var roomItem=myRoomItems.itemMeshes[p];
		if(itemsPositions.length>0){
			var itemIndex=-1;
			for(var h=0;h<itemsPositions.length;h++){
				var itmr=itemsPositions[h];
				if(roomItem.position.x<=itmr.position.x){
					itemIndex=h;
					break;
				}else if(roomItem.position.x===itmr.position.x){
					if(roomItem.position.z>itmr.position.z){
						itemIndex=h;
						break;
					}
				}
			}
			if(itemIndex===-1){
				itemsPositions.push(roomItem);
			}else{
				itemsPositions.splice(itemIndex,0,roomItem);
			}
		}else{
			itemsPositions.push(roomItem);
		}
	}
	itemsPositions.forEach(function(it){
		console.log(it.uuid);
	});
	/*var eastWall=this.allWallMeshes[0];

	var wallWidth=new THREE.Box3().setFromObject(eastWall).getSize().x;
	var shapeWidth=wallWidth-0.1;
	var iShape=new THREE.BoxGeometry(shapeWidth,0.6,0.03);
	var material = new THREE.MeshBasicMaterial( { color: color, overdraw: 0.5 } );
	var texture=THREE.ImageUtils.loadTexture("img/"+color+".jpg");
	var image=new THREE.MeshLambertMaterial({ map: texture });
	texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
	texture.repeat.set(10,2);
	var cube = new THREE.Mesh( iShape, image );
	cube.rotation.set(1.56558,0,0);
	cube.position.set(0,0.882,-1.95);
	for(var k=0;k<myRoomItems.itemMeshes.length;k++){
		this.removeWorkTop(cube,myRoomItems.itemMeshes[k]);
	}

	if(!this.platform){
		this.platform=cube;

		scene.add(this.platform);
		this.intersectObjects.push(this.platform);
	}else{
		this.platform.geometry=cube.geometry;
	}*/
	//this.drawPlatform();
	//interactiveObjects.push(this.platform);
 //	this.createVertexHelper();


}
function calcPolygonArea(object) {
   var _len = object.geometry.faces.length,
        _area = 0.0;

    if (!_len) return 0.0;

    for (var i = 0; i < _len; i++) {
        var va = object.geometry.vertices[object.geometry.faces[i].a];
        var vb = object.geometry.vertices[object.geometry.faces[i].b];
        var vc = object.geometry.vertices[object.geometry.faces[i].c];

        var ab = vb.clone().sub(va);
        var ac = vc.clone().sub(va);

        var cross = new THREE.Vector3();
        cross.crossVectors( ab, ac );

        _area += cross.lengthSq() / 2;
    }
    return _area;
}

this.hideWalls = function() {
					// first make all the walls visible again
					for(var i = 0; i<this.allWallMeshes.length;i++) {
						this.allWallMeshes[i].visible = true
					}

					var originPoint = new THREE.Vector3(camera.position.x, camera.position.y,camera.position.z);
					var directionPoint = new THREE.Vector3( 0, 0, 0 );

					var collisionResults = this.checkIntersection(originPoint, directionPoint, this.allWallMeshes)
					for(var i = 0; i<collisionResults.length;i++) {
						collisionResults[i].object.visible = false
					}

},
this.initRoom = function() {
	// construct floor and add to scene
	this.setRoomShape()
	this.setFloor()
	//this.floorShape.updateMatrix();
	scene.add(this.floorShape);

	this.floorShape.onAfterRender = function(){this.matrixAutoUpdate=false} // solid object and don't recalc unless user action

	interactiveRoomObjs.push(this.floorShape);

	this.roomWallShapesInner();

	this.setAllOpenings();

	this.setAllWallsToScene();
  // var mat = new THREE.MeshPhongMaterial({
  //  color: 0xcccccc,
  //  emissive: new THREE.Color(0x0c0c0c),
  //  shininess: 0,
  //  side: THREE.DoubleSide
  // });
  // var wallGeometry=new THREE.BoxGeometry( 6, 0.2, 2.5  );
  // var wallMesh=new THREE.Mesh(wallGeometry,mat);
  // wallMesh.rotation.x=-1.5707963267948966;
  // scene.add(wallMesh);

  //console.log(this.allWallMeshes)

	// since we drawed the room in wrong axis, now correct them
	this.floorShape.rotation.set(-Math.PI /2, 0,0)
	for(var i=0;i<this.allWallMeshes.length;i++) {
		this.allWallMeshes[i].rotation.set(-Math.PI /2, 0,0)
		this.allWallMeshes[i].onAfterRender = function(){this.matrixAutoUpdate=false} // solid object and don't recalc unless user action

		//Wall interaction...
		//interactiveObjects.push(this.allWallMeshes[i])

	}

	// correct light and camera on the sceen
	g_lookAtObj = this.floorShape;
  camera.position.set(0.02,1.08,4);
	//sceenZoomToObj(g_lookAtObj)
	//setLightTarget(g_lookAtObj)

}


}
