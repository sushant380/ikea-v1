
function VIVECONTROLLER_Interaction() {

	var scope = this
	var teleportIcon


		var radius   = 0.2,
		segments = 32,
		material = new THREE.MeshBasicMaterial( { color: 0xffcc00, 
		side:THREE.DoubleSide,
		transparent: true, opacity: 0.5
		//, map: mProx.textureLoader.load("materials/texture/icons/baby-feet-icon-60777.png")
		} ),
		geometry = new THREE.CircleGeometry( radius, segments );//new THREE.SphereGeometry( radius, 32, 32 ); //
//		geometry = new THREE.BoxGeometry( radius, radius,radius );//new THREE.SphereGeometry( radius, 32, 32 ); //
//		geometry = new THREE.CylinderGeometry( radius, radius, 0.1, 32 );
		
		var teleportIcon = new THREE.Mesh(geometry, material )

		teleportIcon.rotateX(Math.PI/2)
		teleportIcon.visible = false
		scene.add(teleportIcon)

	
	
	
this.teleportationObjects = [],
//this.teleportIcon = this.createTeleportIcon(),
this.teleportPoint,
this.interactionObjects = [],
this.intersectedObjEmissive =[], 
this.tempMatrix = new THREE.Matrix4(),




this.onTriggerDown = function( event ) {
	console.log("into trigger down")
		var controller = event.target;
		console.log(event)

		var intersections = scope.getIntersections( controller ,scope.teleportationObjects);
		console.log(intersections)
		if ( intersections.length > 0 ) {
			var intersection = intersections[ 0 ];
			
			
			// perhaps better to always show a teleportation point if floor is intersected instead of only on trigger?			
			scope.teleportPoint = intersections[ 0 ].point // store intersection point 
			teleportIcon.position.set(scope.teleportPoint.x,scope.teleportPoint.y, scope.teleportPoint.z) // setting point 1cm over floor
			teleportIcon.material.opacity=1
			
		}
		else {
			// reset teleport point just to be on the safe side			
			scope.teleportPoint=undefined
		}

},
this.onTriggerUp = function( event ) {
		var controller = event.target;
		
		// remove icon if existing
//		if(scope.isTeleportIconAttached(controller)) {
//				controller.remove(teleportIcon)	
//		}

		if(scope.teleportPoint!=undefined) {
			//camera.updateMatrix()
			var v = new THREE.Vector3(scope.teleportPoint.x, 0 , scope.teleportPoint.z)
			//trigger teleporation
			controls.teleportationOffset = v
			controls.teleported=true
			controls.resetPose()

			teleportIcon.material.opacity=0.5
			scope.teleportPoint=undefined		
		}

},
this.getIntersections = function ( controller ,iObjArr) {
		scope.tempMatrix.identity().extractRotation( controller.matrixWorld );
		raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
		raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( scope.tempMatrix );
		return raycaster.intersectObjects( iObjArr );
},

this.intersectObjects = function( controller ) {

		var intersections
		// teleportation point
		intersections = scope.getIntersections( controller , scope.teleportationObjects);
		if ( intersections.length > 0 ) {
			var intersection = intersections[ 0 ];
			//var object = intersection.object;
			scope.teleportPoint = intersections[ 0 ].point // store intersection point 
			var pos = scope.teleportPoint//teleportIcon.worldToLocal(scope.teleportPoint)
			
			teleportIcon.position.set(pos.x,pos.y+0.01, pos.z)
			teleportIcon.updateMatrix()
			//console.log(teleportIcon.position)
			teleportIcon.visible = true
			return
		}	
		teleportIcon.visible = false		
		//
		
		// Interactive items..
		intersections = scope.getIntersections( controller , interactiveObjects); //interactiveObjects = global var

		if ( intersections.length > 0 ) {
			var intersection = intersections[ 0 ];
			var object = intersection.object;
			object.userData.currentHex = object.material.color.getHex();
			object.material.color.setHex( 0xffcc00 )
			
			this.intersectedObjEmissive.push( object );
			
			// also handle everything marked as visible from outside
			scope.findFronts( object )
		} 

},
this.cleanIntersectedEmissive = function() {
		
		while ( scope.intersectedObjEmissive.length ) {
			var object = scope.intersectedObjEmissive.pop();
			
			object.material.color.setHex( object.userData.currentHex )
		}
		
},

//this.isTeleportIconAttached = function(controller) {
//	if(teleportIcon.parent==controller) return true
//	else return false
//},
this.findFronts = function(mesh) {
	if(mesh.children== undefined) return
	for(var i=0;i<mesh.children.length;i++) {
			
		if(mesh.children[i].type=="Mesh" && mesh.children[i].userData.isVisibleFromOutside) {
			mesh.children[i].userData.currentHex = mesh.children[i].material.color.getHex();
			mesh.children[i].material.color.setHex( 0xffcc00 )
			
			scope.intersectedObjEmissive.push( mesh.children[i] );		
		}
	scope.findFronts(mesh.children[i])
	}
}

}
