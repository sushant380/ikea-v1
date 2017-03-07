var firstIndex=1;
var secondIndex=2;
var stopAnimation=false;
var selectionBox = new THREE.BoxHelper();
selectionBox.material.depthTest = false;
selectionBox.material.transparent = true;
selectionBox.visible = false;
var box = new THREE.Box3();
var mouseDown=false;
var SELECTEDPLATFORM=undefined;
var INTERSECTEDPLATFORM=undefined;
var lastPoint=undefined;
var fromVector=new THREE.Vector3(0,0,0);
var toVector=new THREE.Vector3(0,0,0);
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
	}else if(object.parent){
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
 function createText(text, x, y, z) {
            var textGeo = new THREE.TextGeometry(text, {
                size: size,
                height: height,
                font: font
            });
            textGeo.computeBoundingBox();
            textGeo.computeVertexNormals();
            textMesh1 = new THREE.Mesh(textGeo, material);
            textMesh1.position.x = x;
            textMesh1.position.y = y;
            textMesh1.position.z = z;
            return textMesh1;
        }

function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 1;
        var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
        var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = fontsize + "px " + fontface;
        var metrics = context.measureText( message );
        var textWidth = metrics.width;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness, fontsize + borderThickness);

        var texture = new THREE.Texture(canvas) 
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite; 
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}


function getPointInBetweenByLen(pointA, pointB, length) {

    var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(length);
    return pointA.clone().add(dir);

}
 function get3dPointZAxis(event)
            {
                var vector = new THREE.Vector3(
                    ( event.clientX / window.innerWidth ) * 2 - 1,
                    - ( event.clientY / window.innerHeight ) * 2 + 1,
                    0.5 );
                projector.unprojectVector( vector, camera );
                var dir = vector.sub( camera.position ).normalize();
                var distance = - camera.position.z / dir.z;
                var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );    
                return pos;
            }
            
            function startDraw(event)
            {
                lastPoint = get3dPointZAxis(event);    
            }

            function stopDraw(event)
            {
                lastPoint = null;
            }
            function getMeasurment(cm,unit){
            	switch (unit) {
                    case 'IN':
                        var realFeet = ((cm * 0.393700) / 12);
                        var feet = Math.floor(realFeet);
                        var inches = Math.round((realFeet - feet) * 12);
                        return feet + "'" + inches + '"';
                    case 'ML':
                        return "" + Math.round(10 * cm) + " mm";
                    case 'CM':
                        return "" + Math.round(10 * cm) / 10 + " cm";
                    case 'M':
                    default:
                        return "" + Math.round(10 * cm) / 1000 + " m";
                }
            }
            function doDraw(event)
            {    
                if( lastPoint )
                {
                    var pos = get3dPointZAxis(event);
                    // var material = new THREE.LineBasicMaterial({
                    //     color: 0x0000ff
                    // });
                   // var geometry = new THREE.Geometry();
                    if( Math.abs(lastPoint.x - pos.x) < 500 && Math.abs(lastPoint.y - pos.y) < 500 && Math.abs(lastPoint.z - pos.z) < 500 )
                    {
                        /*geometry.vertices.push(lastPoint);
                        geometry.vertices.push(pos);
                                        
                        var line = new THREE.Line(geometry, material);
                        scene.add(line);*/

                        var found=false;
                        var direction = pos.clone().sub(lastPoint);
						var length = direction.length();
						var point=getPointInBetweenByLen(lastPoint,pos,length);	
                        for(var k=0;k<scene.children.length;k++){
							if(scene.children[k] instanceof THREE.ArrowHelper){
								found=true;
								scene.children[k]  = new THREE.ArrowHelper(direction.normalize(), lastPoint, length, 0x505050 , 0.1,0.1);
							}
							if(scene.children[k] instanceof THREE.Sprite){
								scene.children[k]= makeTextSprite(getMeasurment(length*100,'ML'), 
							{ fontsize: 8, borderColor: {r:255, g:0, b:0, a:1}, backgroundColor: {r:255, g:100, b:100, a:1} } );
							scene.children[k].position.set(point.x,point.y/2,point.z);
							}					
						}
						if(found===false){
							var arrowHelper= new THREE.ArrowHelper(direction.normalize(), lastPoint, length, 0x505050 ,0.1,0.1 );
							scene.add( arrowHelper );
								
							var spritey = makeTextSprite( getMeasurment(length*100,'ML'), 
							{ fontsize: 24, borderColor: {r:255, g:0, b:0, a:1}, backgroundColor: {r:255, g:100, b:100, a:1} } );
							spritey.position.set(point.x,point.y/2,point.z);
							scene.add( spritey );
						}
						
render();
                      //  lastPoint = pos;        
                    }
                    else
                    {
                        console.debug(lastPoint.x.toString() + ':' + lastPoint.y.toString() + ':' + lastPoint.z.toString()  + ':' + 
                                    pos.x.toString() + ':' + pos.y.toString()  + ':' + pos.z.toString());
                    }
                }
            }
         function onDocumentMouseWheel( e ) {

      var d = ((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):e.detail);
     d = 100 * ((d>0)?1:-1);    
     var cPos = camera.position;
     if (isNaN(cPos.x) || isNaN(cPos.y) || isNaN(cPos.y)) return;

        // Your zomm limitation
        // For X axe you can add anothers limits for Y / Z axes
        if (cPos.x > -2 || cPos.x < 10 ){
           return ;
        }

   mb = d>0 ? 1.1 : 0.9;
   cPos.x = cPos.x * mb;
   cPos.y = cPos.y * mb;
   cPos.z = cPos.z * mb;

}
function onDocumentMouseMove( event ) {
		event.preventDefault();
		// if(event.button===2){
		// 	return;
		// }
		/*if(useRuler){
			controls.noRotate = true;
			doDraw(event);
			return;
		}*/
		/*if(SELECTEDPLATFORM){
            // myRoom.planeView.position.copy(SELECTEDPLATFORM.position);
            // myRoom.planeView.lookAt(camera.position);
            var intersects=raycaster.intersectObject(myRoom.intersectObjects);
           
                var increaseRatio=intersects[0].point.sub(myRoom.platform.position).length() / SELECTEDPLATFORM.position.sub(myRoom.platform.position).length();
                myRoom.platform.scale.set(
                    myRoom.platform.scale.x*increaseRatio,
                    myRoom.platform.scale.y*increaseRatio,
                    myRoom.platform.scale.z*increaseRatio
                );
                //also update other vertexHelpers'position
                for(var i=0;i<myRoom.vertexHelpers.length;i++){
                    var vector=new THREE.Vector3().copy(myRoom.vertexHelpers[i].position.sub(myRoom.platform.position));
                    vector.multiplyScalar(increaseRatio);
                    myRoom.vertexHelpers[i].position.copy(vector);
                }
            
            return;
            //'return' because we don't want the 'picking objects' part 
            //if we were yet dragging something
        }*/
		
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
					//console.log(newPos);
					SELECTED.position.copy( newPos );
				}else { //collision occured
					SELECTED.position.copy(SELECTED.userData.lastGoodPosition)
					offset.copy( intersection ).sub( SELECTED.position )
				}
			}
			return;
		}
		 
        /*if(myRoom.platform){
		var platforms=[];
		var metObject=false,metVertex=false;
	
		var platformintersects = raycaster.intersectObjects( myRoom.intersectObjects);
		if(platformintersects.length>0){
			for(var i=0;i<platformintersects.length;i++){
			            var result=platformintersects[i].object;
			            if(result==myRoom.platform){metObject=true;}
			            if(result.geometry instanceof THREE.SphereGeometry && !metVertex){
			            	metVertex=result;
			            }
			        }
			         if(metVertex){
			            if(INTERSECTEDPLATFORM!=metVertex)INTERSECTEDPLATFORM=metVertex;
			            document.body.style.cursor='move';
			        }else{
			           
			            document.body.style.cursor='auto';
			        }
			         if((metVertex||metObject)&&!mouseDown){
			         	if(myRoom.platform){
				            myRoom.platform.material.opacity=.5;
				            for(var i=0;i<myRoom.vertexHelpers.length;i++){
				                myRoom.vertexHelpers[i].visible=true;
				            }
			        	}
			        }else{
			        	if(myRoom.platform){
				            myRoom.platform.material.opacity=1;
				            for(var i=0;i<myRoom.vertexHelpers.length;i++){
				                myRoom.vertexHelpers[i].visible=false;
				            }
			       		}
			        }
			        return;
		}
	}*/
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		var touches = false
		if(event.touches != undefined && event.touches[ 0 ].pageX!=undefined &&  event.touches[ 0 ].pageY!=undefined ){
			mouse.x=(event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
			mouse.y= -( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;
			touches=true
		}		
		raycaster.setFromCamera( mouse, camera );
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
				mouseDown=true;
				event.preventDefault();
				if(!$(event.target).closest('#colorPanel').length) {
			        if($('#colorPanel').is(":visible")) {
			            $('#colorPanel').hide();
			        }
			    }   
				
				// if(event.button===2){
				// 	return;
				// }
				/*if(useRuler){
					controls.noRotate = true;
					startDraw(event);
					return;
				}*/
/*
				if(INTERSECTEDPLATFORM){
					SELECTEDPLATFORM=INTERSECTEDPLATFORM;
				}*/
				//** test 
				
				
				
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
				mouseDown=false;
				/*if(useRuler){
					stopDraw(event);
					controls.noRotate = false;
					useRuler=false;
					return;
				}
				event.preventDefault();
				if(event.button===2){
					return;
				}*/
				/*SELECTEDPLATFORM=undefined;
				controls.enabled = true;*/

				var touches = false;
				if(event.touches != undefined ){
					touches=true;
				}

				//if ( INTERSECTED ) {
					if(SELECTED!=undefined) {

					//SELECTED.matrixAutoUpdate=true; // IMPORTANT!! allow movement	

					if(touches) {
							SELECTED.material.color.setHex( SELECTED.currentHex );
						}
						
						if(SELECTED.collisionDetect!=undefined && SELECTED.collisionDetect("collidablePostItems")) SELECTED.position.copy(SELECTED.userData.returnPosIfItemCollision)			
						else if(SELECTED.userData.lastGoodPosition!=undefined){ 
							SELECTED.position.copy(SELECTED.userData.lastGoodPosition) 
						}// final ensurance

						//controls.target=SELECTED.position;
					  

						SELECTED = undefined;
					}
					
					//SELECTED = null;
					
				//}
				//SELECTED = null;
				
				
				container.style.cursor = 'auto';
			}