var firstIndex=0;
var secondIndex=1;
function roomAnimation(){
	var firstObject=interactiveObjects[firstIndex].position.clone();
	var secondObject=interactiveObjects[secondIndex].position.clone();
	var tween = new TWEEN.Tween(firstObject).to({
		x:secondObject.x,
		y:secondObject.y,
		z:secondObject.z
	}, 8000);
	tween.onUpdate(function(){

		 firstObject.z =0;
   		camera.position.set(firstObject.x,firstObject.y,firstObject.z);
		camera.lookAt(firstObject);
	});
	tween.onComplete(function(){
		firstIndex++;
		secondIndex++;
		if(firstIndex>=interactiveObjects.length){
			firstIndex++;
		}
		if(secondIndex>=interactiveObjects.length){
			secondIndex++;
		}
		roomAnimation();
	});
	tween.delay(500);
	tween.easing(TWEEN.Easing.Quadratic.In);
	tween.start();
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
							if(SELECTED.userData.lockXTranslation || SELECTED.userData.lockXTranslation!=undefined) newPos.x=SELECTED.userData.lastGoodPosition.x
							if(SELECTED.userData.lockYTranslation || SELECTED.userData.lockYTranslation!=undefined) newPos.y=SELECTED.userData.lastGoodPosition.y
							if(SELECTED.userData.lockZTranslation || SELECTED.userData.lockZTranslation!=undefined) newPos.z=SELECTED.userData.lastGoodPosition.z							
							//console.log(SELECTED.userData.lockXTranslation)
							//console.log(SELECTED.userData.lockYTranslation)
							//console.log(SELECTED.userData.lockZTranslation)
							
							SELECTED.position.copy( newPos );
							
							}
						
						else { //collision occured
							
							SELECTED.position.copy(SELECTED.userData.lastGoodPosition)
							offset.copy( intersection ).sub( SELECTED.position )
						}
					}
					return;
				}
				var intersects = raycaster.intersectObjects(interactiveObjects );

					if ( intersects.length > 0 ) {
						if ( INTERSECTED != intersects[ 0 ].object ) {
							if ( INTERSECTED) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
							INTERSECTED = intersects[ 0 ].object;
							if(INTERSECTED.currentHex==undefined )INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
							plane.setFromNormalAndCoplanarPoint(
								camera.getWorldDirection( plane.normal ),
								INTERSECTED.position );
								
								// ignore if touche
								if(!touches) INTERSECTED.material.color.setHex( 0xffcc00 );	
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
					SELECTED = intersects[ 0 ].object;
					SELECTEDINTERSECT=intersects[ 0 ];
					//console.log(intersection)
					if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
														
						offset.copy( intersection ).sub( SELECTED.position );
					}
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