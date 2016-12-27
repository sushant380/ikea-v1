var firstIndex=1;
var secondIndex=2;
var stopAnimation=false;
var selectionBox = new THREE.BoxHelper();
selectionBox.material.depthTest = false;
selectionBox.material.transparent = true;
selectionBox.visible = false;
var box = new THREE.Box3();

function toScreenXY( position, camera, div ) {
            var pos = position.clone();
            projScreenMat = new THREE.Matrix4();
            projScreenMat.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
            projScreenMat.multiplyVector3( pos );

            var offset = findOffset(div);

            return { x: ( pos.x + 1 ) * div.width / 2 + offset.left,
                 y: ( - pos.y + 1) * div.height / 2 + offset.top };

        }
function findOffset(element) { 
          var pos = new Object();
          pos.left = pos.top = 0;        
          if (element.offsetParent)  
          { 
            do  
            { 
              pos.left += element.offsetLeft; 
              pos.top += element.offsetTop; 
            } while (element = element.offsetParent); 
          } 
          return pos;
        } 
function findObject(object,uuid){
	var found=undefined;
	
	if(object.uuid===uuid){
		found= object;
	}else{
		if(object.children && object.children.length){
			for(var k=0;k<object.children.length;k++){
				found =findObject(object.children[k],uuid);
			}	
		}	
	}
	return found;
}
function findParent(object){
	var parent;
	if(object.isHost){
		parent=object;
	}else 
	if(object.parent){
		parent = findParent(object.parent);
	}else{
		parent= object;
	}
	return parent;
}
function updateBox(object){
	box.setFromObject( object );
					if ( box.isEmpty() === false ) {	
						selectionBox.update( box );
						selectionBox.visible = true;
					}
					if(scene && box){
						scene.add(selectionBox);
					}

}
function roomAnimation(){
	if(stopAnimation==false){
	if(interactiveRoomObjs.length>2){
	var firstObject=interactiveRoomObjs[firstIndex].obj.position.clone();
	var secondObject=interactiveRoomObjs[secondIndex].obj.position.clone();
	firstObject.rotation=0;
	var tween = new TWEEN.Tween(firstObject).to({
		x:secondObject.x,
		y:secondObject.y,
		z:secondObject.z,
		rotation:interactiveRoomObjs[secondIndex].Ori.y
	}, 8000);
	tween.onUpdate(function(){

		 firstObject.z =firstObject.z<0?firstObject.z+1.5:firstObject.z-1.5;
   		camera.position.set(firstObject.x,firstObject.y,firstObject.z);
   		var newRotation = new THREE.Euler( 0, firstObject.rotation, 0);
   		camera.rotation.copy(newRotation);
		camera.lookAt(firstObject);
	});
	tween.onComplete(function(){
		interactiveRoomObjs[secondIndex].playAnimation();
		firstIndex++;
		secondIndex++;
		if(firstIndex>=interactiveRoomObjs.length){
			firstIndex=1;
		}
		if(secondIndex>=interactiveRoomObjs.length){
			secondIndex=1;
		}


		roomAnimation();
	});

	tween.delay(500);
	tween.easing(TWEEN.Easing.Quadratic.In);
	tween.start();
	}else{
		var firstObject=interactiveRoomObjs[firstIndex].obj.position.clone();
		firstObject.z =firstObject.z<0?firstObject.z+1.5:firstObject.z-1.5;
		var newRotation = new THREE.Euler( 0, interactiveRoomObjs[firstIndex].Ori.y, 0);
   		camera.rotation.set(newRotation);
   		camera.position.set(firstObject.x,firstObject.y,firstObject.z);
		camera.lookAt(firstObject);
		camera.updateMatrixWorld( true );
		interactiveRoomObjs[1].playAnimation();
	}
}
}
function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		var touches = false
		if(event.touches != undefined && event.touches[ 0 ].pageX!=undefined &&  event.touches[ 0 ].pageY!=undefined ){
			mouse.x=(event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
			mouse.y= -( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;
			touches=true
		}		
		raycaster.setFromCamera( mouse, camera );
		if ( SELECTED ) {
			SELECTED.matrixAutoUpdate=true // IMPORTANT!! allow movement				
			if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
				/** to do, 
					- check intersection and stop moving
					- control which directions are valid
				**/
			if(SELECTED.collisionDetect==undefined) {
				var newPos = intersection.sub( offset )
				SELECTED.position.copy( newPos );
			}
			else if(!SELECTED.collisionDetect("collidableWalls") || SELECTED.userData.initalMoveAction) {
				//setTimeout(function(){if(SELECTED!=null) SELECTED.userData.initalMoveAction = false},40) // to fix
				SELECTED.userData.initalMoveAction = false
			if(!SELECTED.userData.initalMoveAction) SELECTED.userData.lastGoodPosition = SELECTED.position.clone() //allow some time in case something has got stuck
				var newPos = intersection.sub( offset )
					// handle axis locking
			//	if(SELECTED.userData.lockXTranslation || SELECTED.userData.lockXTranslation!=undefined) newPos.x=SELECTED.userData.lastGoodPosition.x
			//	if(SELECTED.userData.lockYTranslation || SELECTED.userData.lockYTranslation!=undefined) newPos.y=SELECTED.userData.lastGoodPosition.y
			//		if(SELECTED.userData.lockZTranslation || SELECTED.userData.lockZTranslation!=undefined) newPos.z=SELECTED.userData.lastGoodPosition.z							
					//console.log(SELECTED.userData.lockXTranslation)
					//console.log(SELECTED.userData.lockYTranslation)
					//console.log(SELECTED.userData.lockZTranslation)
					console.log(newPos);
					SELECTED.position.copy( newPos );
				}else { //collision occured
					SELECTED.position.copy(SELECTED.userData.lastGoodPosition)
					offset.copy( intersection ).sub( SELECTED.position )
				}
			}
			return;
		}
		var intersects = raycaster.intersectObjects(interactiveObjects );
			if ( intersects.length > 0 ) {
				if ( INTERSECTED != intersects[ 0 ].object ) {
					//if ( INTERSECTED) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
					INTERSECTED = intersects[ 0 ].object;
					if(INTERSECTED.currentHex==undefined && INTERSECTED.material && INTERSECTED.material.color)INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
					plane.setFromNormalAndCoplanarPoint(
						camera.getWorldDirection( plane.normal ),
						INTERSECTED.position );
						
						// ignore if touche
					//	if(!touches) INTERSECTED.material.color.setHex( 0xffcc00 );	
				}
				container.style.cursor = 'pointer';
				} else {
					if ( INTERSECTED && INTERSECTED.currentHex!=undefined) {
							INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
							INTERSECTED.currentHex=undefined
						}
					INTERSECTED = null;
					container.style.cursor = 'auto';
				}
			}
			function onDocumentMouseDown( event ) {
				event.preventDefault();
				
				//** test 
				
				raycaster.setFromCamera( mouse, camera );
				
				var touches = false
				if(event.touches != undefined && event.touches[ 0 ].pageX!=undefined &&  event.touches[ 0 ].pageY!=undefined ){
					mouse.x=(event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
					mouse.y= - ( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;
					touches = true
				}

				raycaster.setFromCamera( mouse, camera );
				var intersects = raycaster.intersectObjects( interactiveObjects );

//				console.log(intersects)			
					
				if ( intersects.length > 0 ) {
					controls.enabled = false;
					SELECTED=findParent(intersects[ 0 ].object)
					SELECTEDINTERSECT=SELECTED;
					/*for(var m=0;m<interactiveRoomObjs.length;m++){
						if(interactiveRoomObjs[m].obj){
						var found=findObject(interactiveRoomObjs[m].obj,SELECTED.uuid);
						if(found){
							console.log(found);
							break;
						}
					}
					}*/
					//console.log(intersection)
					if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
														
						offset.copy( intersection ).sub( SELECTED.position );
					}
					
					updateBox(SELECTED);
					//console.log(intersection)
					//console.log(intersects)
					
					// init stored pos
					SELECTED.userData.initalMoveAction=true
					SELECTED.userData.returnPosIfItemCollision = SELECTED.position.clone() //
					SELECTED.userData.lastGoodPosition = SELECTED.position.clone()
					if(touches) {
						SELECTED.currentHex = SELECTED.material.color.getHex();
						SELECTED.material.color.setHex( 0xffcc00 );	
						//console.log("start")

						}
					container.style.cursor = 'move';
					render();
				}
			}
			function onDocumentMouseUp( event ) {
				event.preventDefault();
				controls.enabled = true;

				var touches = false;
				if(event.touches != undefined ){
					touches=true;
				}

				//if ( INTERSECTED ) {
					if(SELECTED!=undefined) {

					SELECTED.matrixAutoUpdate=true; // IMPORTANT!! allow movement	

					if(touches) {
							SELECTED.material.color.setHex( SELECTED.currentHex );
						}
						
						if(SELECTED.collisionDetect!=undefined && SELECTED.collisionDetect("collidablePostItems")) SELECTED.position.copy(SELECTED.userData.returnPosIfItemCollision)			
						else if(SELECTED.userData.lastGoodPosition!=undefined) SELECTED.position.copy(SELECTED.userData.lastGoodPosition) // final ensurance

						controls.target=SELECTED.position;
					  

						SELECTED = undefined;
					}
					if(SELECTED){
					
				}
					//SELECTED = null;
					
				//}
				//SELECTED = null;
				
				
				container.style.cursor = 'auto';
			}