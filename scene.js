"use strict";
var camera, scene, renderer, dirLight, g_lookAtObj, lastCameraPos = new THREE.Vector3( 0, 0, 0 ), myRoom, controls, effect, g_DeviceType, 
clock,exporterHelpers,personStandingHeight, controlsUI, debugUI,roundedRectShapemesh, platform,useRuler,projector;

			var interactiveObjects = [];
			var interactiveRoomObjs = []
			
			var plane = new THREE.Plane();
			var raycaster
			var mouse = new THREE.Vector2(),
			offset = new THREE.Vector3(),
			intersection = new THREE.Vector3(),
			INTERSECTED, SELECTED,
			container;
			
			clock = new THREE.Clock();	
			
			var controller1, controller2; //vive
			
			var skyBoxDefault = new SkyBox()
			skyBoxDefault.drawShaderSkybox()
			
			var ViveControlInteractions // test of interacting with vive
			
			var g_transparentObjs = true // revert since it don't dynamic change... should loop over material and change this instead

		function init() {
				/** when reload **/
				camera = undefined
				scene = undefined
				renderer = undefined
				g_lookAtObj = undefined
				controls = undefined
				dirLight = undefined
				
				raycaster = new THREE.Raycaster();
				interactiveObjects = []
				plane = new THREE.Plane();
				mouse = new THREE.Vector2()
				offset = new THREE.Vector3()
				intersection = new THREE.Vector3()
				INTERSECTED = undefined
				SELECTED = undefined
				container = undefined
				effect
				/** **/
				
				personStandingHeight = 1.6 // default standing height
				
				scene = new THREE.Scene();
				// LIGHTS
				var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
				hemiLight.position.set( 0, 0, 500 );
				scene.add( hemiLight ); 
				//
				
				var light = new THREE.AmbientLight( 0x404040 ); // soft white light
				scene.add( light );


				dirLight = new THREE.DirectionalLight( 0x404040, 0.7 );
				dirLight.castShadow = true; 
				scene.add( dirLight );
//				var helper = new THREE.CameraHelper( dirLight.shadow.camera );
//				scene.add( helper );

				var dirLight2 = new THREE.DirectionalLight( 0xffffff, 0.3 );
				dirLight2.castShadow = true; 
				dirLight2.position.set(0,4,0)
				scene.add( dirLight2 );				
//				var helper = new THREE.CameraHelper( dirLight2.shadow.camera );
//				scene.add( helper );			

				var ua = detect.parse(navigator.userAgent);
				//console.log(ua)
				
				
				//renderer
				renderer = renderer = Detector.webgl? new THREE.WebGLRenderer({antialias:true}): alert("No WebGL support")//new THREE.CanvasRenderer(); //new THREE.WebGLRenderer({antialias:true});
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );

	
			
				container = document.createElement( 'div' );
				document.body.appendChild( container );
				
				container.appendChild( renderer.domElement );
				renderer.domElement.id = "context"
				renderer.setClearColor( 0xffffff ); // scene background
				
				renderer.shadowMap.enabled = true;
				renderer.shadowMap.type = THREE.PCFSoftShadowMap;				
//setHelpers();
				
				debugUI = document.createElement( 'div' );
				debugUI.style="position: absolute; top: 10px; left:20px; width: 100%; text-align: right; "
				document.body.appendChild( debugUI );
				
				/** control UI **/
				controlsUI = document.createElement( 'div' );
				controlsUI.style="position: absolute; top: 10px;  width: 100%; text-align: left; "
				document.body.appendChild( controlsUI );
				var CamConUI="" 
	
				// init persp cam
				

				// device dependent settings
				if(ua.device.type=="Desktop") {
					setPerspective() // start with perspective camera
					g_DeviceType = ua.device.type

					CamConUI += "<div class=\"container-fluid\"><div class=\"row\"><div class=\"col-md-11\">";
					CamConUI+="Select Room : <select id=\"rpdChanger\" class=\"selectpicker\" onchange=\"changeRpd()\">";
					for(var i=0;i<rpd_array.length;i++){
						CamConUI+='<option value=\"'+rpd_array[i].id+'\">'+rpd_array[i].label+'</option>';
					}
					CamConUI += "</select><br>";
					
					CamConUI += "</div><div class=\"col-md-1\"><button data-toggle=\"tooltip\" data-placement=\"left\" title=\"Full Screeen\" style=\"margin-top:5px;\" type=\"button\" class=\"btn pull-right\" onclick=\"fullscreen();return false;\"><img style=\"width:32px;height:32px;\" src=\"img/fullscreen.png\"></img></button>"
					CamConUI += "<button type=\"button\"  class=\"btn pull-right\" data-toggle=\"modal\" data-target=\"#myModal\" title=\"Customize Worktop\" style=\"margin-top:5px;\"> <img data-toggle=\"tooltip\" data-placement=\"left\" style=\"width:32px;height:32px;\" src=\"img/customize.png\"></img></button>";
					// Orto cam
					/*CamConUI += "<a href=\"#\" onclick=\"setPerspective();return false;\">Perspective</a> | "
					//
					CamConUI += "<a href=\"#\" onclick=\"setOrthographic();return false;\"> Orthographic</a> | "
					CamConUI += "<br><a href=\"#\" onclick=\"setVive();return false;\">Vive</a>"	
					CamConUI += "<br><a href=\"#\" onclick=\"setVive(0.5);return false;\">Vive 0.5m</a>"
					CamConUI += "<br><a href=\"#\" onclick=\"setVive(1);return false;\">Vive 1m</a>"
					CamConUI += "<br><a href=\"#\" onclick=\"setVive(2);return false;\">Vive 2m</a>"*/
					//CamConUI += "<button type=\"button\" class=\"btn btn-primary\" onclick=\"setPerspective();;return false;\" checked=true>Orbit Control<br></button>"
					//CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=false;setDeviceOrientationControl();;return false;\">Animate<br>"
					//CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setPerspective();;return false;\">Stop<br>"
					CamConUI+= "<button type=\"button\" style=\"margin-top:5px;\" class=\"btn pull-right\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"Open\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setOpen();return false;\"><img style=\"width:32px;height:32px;\" src=\"img/open.png\"></img></button>";
					CamConUI+= "<button type=\"button\" style=\"margin-top:5px;\" class=\"btn pull-right\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"Close\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setClose();return false;\"><img style=\"width:32px;height:32px;\" src=\"img/close.png\"></img></button>";
					/*CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=0.5;setDeviceOrientationControl();;return false;\">Toddler<br>"
					CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.3;setDeviceOrientationControl();;return false;\">Kid<br>"
					CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.6;setDeviceOrientationControl();;return false;\">Lady<br>"
					*/
					//exporterHelpers = new ExporterHelper() // set
					//CamConUI += "<br><button type=\"button\" class=\"btn btn-primary\"  onclick=\"exporterHelpers.exportToObj();\"> Export Scene to OBJ</a>"
				//	CamConUI += "<button type=\"button\" class=\"btn btn-primary\"  onclick=\"startRuler();\"> Ruler</button>"
					
					
					 CamConUI+="</div></div>";

		
					/**<a href="#" onclick="exportToJSON();"> Export Scene to JSON</a>**/ //TODO			
					
			
				}
				else if(ua.device.type=="Tablet") {
					g_DeviceType = ua.device.type
					
					CamConUI += "<div class=\"container-fluid\"><div class=\"row\"><div class=\"col-md-11\">";
					CamConUI+="Select Room : <select id=\"rpdChanger\" class=\"selectpicker\" onchange=\"changeRpd()\">";
					for(var i=0;i<rpd_array.length;i++){
						CamConUI+='<option value=\"'+rpd_array[i].id+'\">'+rpd_array[i].label+'</option>';
					}
					CamConUI += "</select><br>";
					CamConUI += "</div><div class=\"col-md-1\"><button data-toggle=\"tooltip\" data-placement=\"left\" title=\"Full Screeen\" style=\"margin-top:5px;\" type=\"button\" class=\"btn pull-right\" onclick=\"fullscreen();return false;\"><img style=\"width:32px;height:32px;\" src=\"img/fullscreen.png\"></img></button>"
					CamConUI += "<button type=\"button\" data-toggle=\"tooltip\" data-placement=\"left\" class=\"btn pull-right\" data-toggle=\"modal\" data-target=\"#myModal\" title=\"Customize Worktop\" style=\"margin-top:5px;\"> <img style=\"width:32px;height:32px;\" src=\"img/customize.png\"></img></button>";
					CamConUI+= "<button type=\"button\" style=\"margin-top:5px;\" class=\"btn pull-right\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"Open\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setOpen();return false;\"><img style=\"width:32px;height:32px;\" src=\"img/open.png\"></img></button>";
					CamConUI+= "<button type=\"button\" style=\"margin-top:5px;\" class=\"btn pull-right\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"Close\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setClose();return false;\"><img style=\"width:32px;height:32px;\" src=\"img/close.png\"></img></button>";
				
					
					 CamConUI+="</div></div>";
					//CamConUI += "<br><a href=\"#\"  onclick=\"exporterHelpers.exportToObj();\"> Export Scene to OBJ</a><br>"
					/*CamConUI += "<br><a href=\"#\" onclick=\"fullscreen();return false;\">Fullscreen</a>"
					CamConUI += "<br><input type=\"radio\" name=\"controlModeAndEffect\" onclick=\"setPerspective();\" checked=true>Orbit Control<br>"
					CamConUI += "<br><input type=\"radio\" name=\"controlModeAndEffect\" onclick=\"setDeviceOrientationControl();\">Device Control<br>"
					CamConUI += "<br><input type=\"radio\" name=\"controlModeAndEffect\" onclick=\"personStandingHeight=1.8;setDeviceOrientationControl();\">Man<br>"
					CamConUI += "<br><input type=\"radio\" name=\"controlModeAndEffect\" onclick=\"personStandingHeight=0.5;setDeviceOrientationControl();\">Toddler<br>"
					CamConUI += "<br><input type=\"radio\" name=\"controlModeAndEffect\" onclick=\"personStandingHeight=1.3;setDeviceOrientationControl();\">Kid<br>"
					CamConUI += "<br><input type=\"radio\" name=\"controlModeAndEffect\" onclick=\"personStandingHeight=1.6;setDeviceOrientationControl();\">Lady<br>"

						*/			
					//CamConUI += "<br><a href=\"#\" onclick=\"fullscreen();return false;\">Fullscreen</a><br>"
					// Orto cam
					/*CamConUI += "<a href=\"#\" onclick=\"setPerspective();return false;\">Perspective</a> | "
					//
					CamConUI += "<a href=\"#\" onclick=\"setOrthographic();return false;\"> Orthographic</a> | "
					CamConUI += "<br><a href=\"#\" onclick=\"setVive();return false;\">Vive</a>"	
					CamConUI += "<br><a href=\"#\" onclick=\"setVive(0.5);return false;\">Vive 0.5m</a>"
					CamConUI += "<br><a href=\"#\" onclick=\"setVive(1);return false;\">Vive 1m</a>"
					CamConUI += "<br><a href=\"#\" onclick=\"setVive(2);return false;\">Vive 2m</a>"*/
					//CamConUI += "<br><a href=\"#\" onclick=\"setPerspective();;return false;\" checked=true>Orbit Control<br>"
					//CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=false;setDeviceOrientationControl();;return false;\">Animate<br>"
					//CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setPerspective();;return false;\">Stop<br>"
					//CamConUI+= "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setOpen();return false;\">Open<br>";
					//CamConUI+= "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setClose();return false;\">Close<br>";
					
					setPerspective() // default
				
				}
				else if(ua.device.type=="Mobile") {
					g_DeviceType = ua.device.type
					CamConUI += "<div class=\"container-fluid\"><div class=\"row\"><div class=\"col-md-11\">";
					CamConUI+="Select Room : <select id=\"rpdChanger\" class=\"selectpicker\" onchange=\"changeRpd()\">";
					for(var i=0;i<rpd_array.length;i++){
						CamConUI+='<option value=\"'+rpd_array[i].id+'\">'+rpd_array[i].label+'</option>';
					}
					CamConUI += "</select><br>";
					CamConUI += "</div><div class=\"col-md-1\"><button data-toggle=\"tooltip\" data-placement=\"left\" title=\"Full Screeen\" style=\"margin-top:5px;\" type=\"button\" class=\"btn pull-right\" onclick=\"fullscreen();return false;\"><img style=\"width:32px;height:32px;\" src=\"img/fullscreen.png\"></img></button>"
					CamConUI += "<button type=\"button\" data-toggle=\"tooltip\" data-placement=\"left\" class=\"btn pull-right\" data-toggle=\"modal\" data-target=\"#myModal\" title=\"Customize Worktop\" style=\"margin-top:5px;\"> <img style=\"width:32px;height:32px;\" src=\"img/customize.png\"></img></button>";
					CamConUI+= "<button type=\"button\" style=\"margin-top:5px;\" class=\"btn pull-right\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"Open\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setOpen();return false;\"><img style=\"width:32px;height:32px;\" src=\"img/open.png\"></img></button>";
					CamConUI+= "<button type=\"button\" style=\"margin-top:5px;\" class=\"btn pull-right\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"Close\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setClose();return false;\"><img style=\"width:32px;height:32px;\" src=\"img/close.png\"></img></button>";
				
					
					 CamConUI+="</div></div>";
					/*CamConUI += "<br><a href=\"#\" onclick=\"fullscreen();return false;\">Fullscreen</a>"
					CamConUI += "<br><a href=\"#\" onclick=\"setPerspective();;return false;\" checked=true>Orbit Control<br>"
				CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;setDeviceOrientationControl();;return false;\">Man<br>"
					CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=0.5;setDeviceOrientationControl();;return false;\">Toddler<br>"
					CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.3;setDeviceOrientationControl();;return false;\">Kid<br>"
					CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.6;setDeviceOrientationControl();;return false;\">Lady<br>"
					CamConUI += "<br><a href=\"#\" onclick=\"setStereoEffect();return false;\">Toggle Stereo</a>"

*/					//CamConUI += "<br><button type=\"button\" class=\"btn btn-primary\" onclick=\"fullscreen();return false;\">Fullscreen</a><br>"
					// Orto cam
					/*CamConUI += "<a href=\"#\" onclick=\"setPerspective();return false;\">Perspective</a> | "
					//
					CamConUI += "<a href=\"#\" onclick=\"setOrthographic();return false;\"> Orthographic</a> | "
					CamConUI += "<br><a href=\"#\" onclick=\"setVive();return false;\">Vive</a>"	
					CamConUI += "<br><a href=\"#\" onclick=\"setVive(0.5);return false;\">Vive 0.5m</a>"
					CamConUI += "<br><a href=\"#\" onclick=\"setVive(1);return false;\">Vive 1m</a>"
					CamConUI += "<br><a href=\"#\" onclick=\"setVive(2);return false;\">Vive 2m</a>"*/
					//CamConUI += "<br><a href=\"#\" onclick=\"setPerspective();;return false;\" checked=true>Orbit Control<br>"
					//CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=false;setDeviceOrientationControl();;return false;\">Animate<br>"
					//CamConUI += "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setPerspective();;return false;\">Stop<br>"
					//CamConUI+= "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setOpen();return false;\">Open<br>";
					//CamConUI+= "<br><a href=\"#\" onclick=\"personStandingHeight=1.8;stopAnimation=true;setClose();return false;\">Close<br>";
					
					//setDeviceOrientationControl()
					setPerspective() // default

				}
				
				/** deviceorientation **/
				
				//add condition
				//window.addEventListener('deviceorientation', setOrientationControls, true);
				
				// event for window resize 
				window.addEventListener( 'resize', onWindowResize, false );
															
				// event which will be called after async loads to trigger rerendering
				renderer.domElement.addEventListener( 'rerender', render, false );
				
				// Show Controls
		
				// RPD box
				controlsUI.innerHTML=CamConUI;
				 
				}
			function changeRpd(){
				var rpd=$('#rpdChanger').val();
				for(var m=0;m<rpd_array.length;m++){
					if(rpd_array[m].id===rpd){
						RPD_Raw=rpd_array[m].rpd;
						break;
					}
				}
				var element = document.getElementById("context");
				if(element!=undefined) 	element.parentNode.removeChild(element);
				if(RPD_Raw.length>1) {
				init();
				RPDMgmt.initRPD();
			}

			}
			function startRuler(){
				useRuler=true;
			}
			/** HTC Vive **/
			function setOpen(){
				if(SELECTEDINTERSECT){
					for(var n=0;n<interactiveRoomObjs.length;n++){
						if(interactiveRoomObjs[n].obj){
							console.log(interactiveRoomObjs[n].obj.uuid+"  "+SELECTEDINTERSECT.uuid);
							if(interactiveRoomObjs[n].obj.uuid===SELECTEDINTERSECT.uuid){
								interactiveRoomObjs[n].playAnimation();
							}
						}
					}
				}
			}
			function setClose(){
				if(SELECTEDINTERSECT){
					for(var n=0;n<interactiveRoomObjs.length;n++){
						if(interactiveRoomObjs[n].obj){
							console.log(interactiveRoomObjs[n].obj.uuid+"  "+SELECTEDINTERSECT.uuid);
							if(interactiveRoomObjs[n].obj.uuid===SELECTEDINTERSECT.uuid){
								interactiveRoomObjs[n].stopAnimation();
							}
						}
					}
				}
			}
			function customizeWorkTop(){

			}
			function drawShape(shape,color){

				switch(shape){
					case 'L':
						myRoom.drawLshapePlatform(color);
						break;
					case 'U':
						myRoom.drawUshapePlatform(color);
						break;
					case 'I':
						myRoom.drawIshapePlatform(color);
						break;
				}
			}
			function setVive(userHeight) {

				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 300 );
				camera.position.set(0, userHeight-0.2, 0); // set person in center
				camera.updateProjectionMatrix()
				
				controls = new THREE.VRControls( camera );
				controls.standing = true;
				
				//controls.overrideVrDisplayStageParameters()
				controls.userHeight  = userHeight //|| 1.6

				// controllers

				controller1 = new THREE.ViveController( 0 );
				controller1.standingMatrix = controls.getStandingMatrix();
				scene.add( controller1 );

				controller2 = new THREE.ViveController( 1 );
				controller2.standingMatrix = controls.getStandingMatrix();
				scene.add( controller2 );

				var loader = new THREE.OBJLoader();
				loader.setPath( 'models/obj/vive-controller/' );
				loader.load( 'vr_controller_vive_1_5.obj', function ( object ) {

					var loader = new THREE.TextureLoader();
					loader.setPath( 'models/obj/vive-controller/' );

					var controller = object.children[ 0 ];
					controller.material.map = loader.load( 'onepointfive_texture.png' );
					controller.material.specularMap = loader.load( 'onepointfive_spec.png' );

					controller1.add( object.clone() );
					controller2.add( object.clone() );

				} );
				// test Right Left
				
				var radius   = 0.05,
				segments = 32,
				materialR = new THREE.LineBasicMaterial( { color: 0xffcc00 } ),
				materialL = new THREE.LineBasicMaterial( { color: 0x0033cc } ),
				geometry = new THREE.CircleGeometry( radius, segments );
				var circleR = new THREE.Mesh(geometry, materialR ) 
				var circleL = new THREE.Mesh(geometry, materialL ) 
				circleR.position.set(0.1,0.05,-0.1)
				circleL.position.set(-0.1,0.05,-0.1)

				controller1.add(circleR)
				controller2.add(circleL)

				effect = new THREE.VREffect( renderer );
				
				// Vive control teleport & interactions
				controller1.userData.Interactions = new VIVECONTROLLER_Interaction()
				controller1.userData.Interactions.teleportationObjects = interactiveRoomObjs

				controller1.addEventListener( 'thumbpaddown', controller1.userData.Interactions.onTriggerDown );
				controller1.addEventListener( 'thumbpadup', controller1.userData.Interactions.onTriggerUp );	
				//

				if(skyBoxDefault.isEnabled==false) skyBoxDefault.addSkyBox() // add a skybox

				
				if ( WEBVR.isAvailable() === true ) {

					document.body.appendChild( WEBVR.getButton( effect ) );
					
					window.addEventListener( 'vrdisplaypresentchange', tiggerVRPresenting, false );
					//renderer.domElement.addEventListener( 'mouseup', triggerControlStubUpAndMove, false)
		
				}

				//	
			}
			function tiggerVRPresenting(event) {
				//console.log(event)
				/**
				TODO, stop animation somehow...
				**/
				
				var VRDisplayPresenting = event.display.isPresenting
				if(VRDisplayPresenting) animate_vive()
//				else if(!VRDisplayPresenting) 
				//console.log(effect)
			}
	
	
			/** cardboard **/
			function setStereoEffect() {
					if(effect == undefined) {
						effect = new THREE.StereoEffect(renderer);
						//fullscreen()
						onWindowResize()
					}
					else {
						effect= undefined
						onWindowResize()
					}
			}			
			
			function setDeviceOrientationControl() {

if(skyBoxDefault.isEnabled) skyBoxDefault.removeSkyBox() // remove skybox?

					g_transparentObjs=false // don't have transparent objects

					//console.log("INTO setDeviceOrientationControl" )
									
					camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 300 );
					camera.useQuaternion = true;
					//camera.position.set(0, personStandingHeight-0.2, 0);
					 // set person in center
					camera.updateProjectionMatrix();

					if(controls!=undefined) controls.dispose()
				controls =new THREE.OrbitControls(camera, renderer.domElement);
				controls.maxPolarAngle = Math.PI/2 // don't allow to see under roomt				
				controls.target.set(2.699999625,1.08,-0.6749995000000002);


				addHandleWallVisabilityEventsListeners()
				addAllMouseEventsListeners()
				addAllToucheEventsListeners()
				addKeyboardEvents();
//				console.log(controls)
//				console.log(renderer.domElement)
				//if(skyBoxDefault.isEnabled==false) skyBoxDefault.addSkyBox() 
				//VIVECTL() // test ctrl
			
					
					/*if(controls!=undefined) controls.dispose()					
					
					controls = new THREE.DeviceOrientationControls(camera)//, true);
					//controls.enableZoom  = false;
					//controls.enablePan = false;	
					controls.connect();
					controls.update();
*/

				window.removeEventListener('deviceorientation', setDeviceOrientationControl, true);	
				
				if(skyBoxDefault.isEnabled==false) skyBoxDefault.addSkyBox() // add a skybox				
				animate_OC();
				roomAnimation();
				
			}
				
			
			function addHandleWallVisabilityEventsListeners() {
				//add event for Wall visibility
				controls.addEventListener( 'change', handleWallVisability, false )
			}
			function removeHandleWallVisabilityEventsListeners() {
				//add event for Wall visibility
				controls.removeEventListener( 'change', handleWallVisability, false )
			}
			
			function addAllMouseEventsListeners() {
				// interact
				renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
				renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
				renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
				
				// only render on input fo performance...
				renderer.domElement.addEventListener( 'mousemove', render, false );
				renderer.domElement.addEventListener( 'mousedown', render, false );
				renderer.domElement.addEventListener( 'mouseup', render, false );
				
			}
			function addKeyboardEvents(){
				//document.addEventListener("keydown", checkRotation, false);
				//document.addEventListener("keyup",   checkRotation,   false);	
				

			}
			
			function removeAllMouseEventsListeners() {
				// interact
				renderer.domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				renderer.domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
				renderer.domElement.removeEventListener( 'mouseup', onDocumentMouseUp	, false );
				
				// only render on input fo performance...
				renderer.domElement.removeEventListener( 'mousemove', render, false );
				renderer.domElement.removeEventListener( 'mousedown', render, false );
				renderer.domElement.removeEventListener( 'mouseup', render, false );
				
			}
			
			function addAllToucheEventsListeners() {
				// interact
				renderer.domElement.addEventListener( 'touchmove', onDocumentMouseMove, false );
				renderer.domElement.addEventListener( 'touchstart', onDocumentMouseDown, false );
				renderer.domElement.addEventListener( 'touchend', onDocumentMouseUp, false );
				
				// only render on input fo performance...
				renderer.domElement.addEventListener( 'touchmove', render, false );
				renderer.domElement.addEventListener( 'touchstart', render, false );
				renderer.domElement.addEventListener( 'touchend', render, false );
				
			}
			
			function removeAllToucheEventsListeners() {
				// interact
				renderer.domElement.removeEventListener( 'touchmove', onDocumentMouseMove, false );
				renderer.domElement.removeEventListener( 'touchstart', onDocumentMouseDown, false );
				renderer.domElement.removeEventListener( 'touchend', onDocumentMouseUp, false );
				
				// only render on input fo performance...
				renderer.domElement.removeEventListener( 'touchmove', render, false );
				renderer.domElement.removeEventListener( 'touchstart', render, false );
				renderer.domElement.removeEventListener( 'touchend', render, false );
				
			}
			
			function handleWallVisability() {
					if(myRoom != undefined) myRoom.hideWalls()
			}
			
				
			function sceenZoomToObj(obj) {
				if(obj==undefined) return
				/** test zoom correct **/
				var bbox = new THREE.Box3().setFromObject(obj);
				
				var COG =  bbox.getCenter();

				var sphereSize = bbox.getSize().length() * 0.5;
				var distToCenter
				if(camera.fov == undefined) { // handle Camera
					distToCenter = bbox.getSize().length()
					camera.position.set(distToCenter,distToCenter,distToCenter)
					camera.zoom = distToCenter*distToCenter
				//	console.log(camera.zoom)
					camera.updateProjectionMatrix()

				}
				else {
					distToCenter = sphereSize/Math.sin( Math.PI / 180.0 * camera.fov * 1); 
					camera.position.set(distToCenter,distToCenter,distToCenter)
				}

				//console.log(camera)
			}
			function setLightTarget(obj) {
					dirLight.target=obj 
			}
			
			function setHelpers() {
				/** helpers **/
				
				var axis = new THREE.AxisHelper();
				axis.scale.set(10,10,10);
				scene.add(axis);
				
				var gridplaneSize = 10;
				var gridstep = 20;
				var gridcolor = 0xCCCCCC;
				var gridHelper_xy = new THREE.GridHelper(gridplaneSize, gridstep, gridcolor );
				scene.add(gridHelper_xy);
				
			}
			
			function onWindowResize() {
				if(g_DeviceType=="Desktop") {
					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();
					renderer.setSize( window.innerWidth, window.innerHeight );
					render()
				}
				else if(g_DeviceType=="Mobile" || g_DeviceType=="Tablet") {
					var width = container.offsetWidth;
					var height = container.offsetHeight;

					camera.aspect = width / height;
					camera.updateProjectionMatrix();

					renderer.setSize(width, height);
					if(effect!=undefined) effect.setSize(width, height);
				}    
			}
			/** Vive controls **/
			
			function animate_vive() {
				//TODO, kolla om animation stängs av när man stänger av VR mode
							
				effect.requestAnimationFrame( animate_vive );
				if(effect.isPresenting) {
					//console.log(effect)
					render_vive();
					//console.log(effect.isPresenting)
				}	
			}
			
			function render_vive() {
				controller1.update();
				controller2.update();
				
				controller1.userData.Interactions.cleanIntersectedEmissive();
				controller1.userData.Interactions.intersectObjects( controller1 );

				
				controls.update();
				effect.render( scene, camera );
			}
			
			/** Normal Controls **/
			function animate_OC() { //Orbit Control

//				console.log('in animate '+camera.uuid);
				TWEEN.update();
				requestAnimationFrame( animate_OC );
				renderer.render( scene, camera );
				
			}
			function render_OC() { //Orbit Control
				if(effect!=undefined) effect.render(scene, camera);
				else renderer.render( scene, camera );
				controls.update();
 			    camera.updateProjectionMatrix();

			}
					
			function animate_DC() {
			  if(controls instanceof THREE.DeviceOrientationControls) window.requestAnimationFrame(animate_DC);
			  update_DC();
			  render_DC();
			}

	
			function update_DC() {
			  //onWindowResize();
			  camera.updateProjectionMatrix();
			  controls.update()//controls.update(dt);
			}
			function render_DC() { //DeviceControl
				//update_DC(dt)
				dirLight.position.set( camera.position.x, camera.position.y, camera.position.z ); // make dir light follow camera

				if(effect!=undefined) effect.render(scene, camera);
				else renderer.render( scene, camera );
			}
	

			function render() {
				dirLight.position.set( camera.position.x, camera.position.y, camera.position.z ); // make dir light follow camera
				
				if(controls instanceof THREE.OrbitControls) {
					//debugUI.innerHTML = "<br>"+new Date().getTime() + " - OC rendering" + debugUI.innerHTML 
					render_OC()
				}
				
				else if(controls instanceof THREE.DeviceOrientationControls) {
					//debugUI.innerHTML = "<br>"+new Date().getTime() + " - DC rendering"+ debugUI.innerHTML 
					render_DC()
				}	
			}
			
			
			function setOrthographic() {
				camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.01, 300 );//new THREE.CombinedCamera( window.innerWidth / 2, window.innerHeight / 2, 70, 1, 1000, - 500, 1000 ); //

				if(controls!=undefined) controls.dispose()
				controls =new THREE.OrbitControls(camera, renderer.domElement);
				controls.maxPolarAngle = Math.PI/2 // don't allow to see under roomt
				sceenZoomToObj(g_lookAtObj)				

				render();
			}
			function setPerspective() {

				if(skyBoxDefault.isEnabled) skyBoxDefault.removeSkyBox() // remove skybox?
				
				
				if(controller1!=undefined) scene.remove(controller1)
				if(controller2!=undefined) scene.remove(controller2)
							
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 300 );	
				projector = new THREE.Projector();
				if(controls!=undefined) controls.dispose()
				controls =new THREE.OrbitControls(camera, renderer.domElement);
				controls.maxPolarAngle = Math.PI/2 // don't allow to see under roomt				
				sceenZoomToObj(g_lookAtObj)	
				addHandleWallVisabilityEventsListeners()
				addAllMouseEventsListeners()
				addAllToucheEventsListeners()
//				console.log(controls)
//				console.log(renderer.domElement)
				//if(skyBoxDefault.isEnabled==false) skyBoxDefault.addSkyBox() 
				//VIVECTL() // test ctrl
				render();
			}
			
			function fullscreen() {
			  if (container.requestFullscreen) {
				container.requestFullscreen();
			  } else if (container.msRequestFullscreen) {
				container.msRequestFullscreen();
			  } else if (container.mozRequestFullScreen) {
				container.mozRequestFullScreen();
			  } else if (container.webkitRequestFullscreen) {
				container.webkitRequestFullscreen();
			  }
			  
	//		  render()
			}
			

			
// ViveControls debug
/**
function VIVECTL() {
					// controllers

				controller1 = new THREE.ViveController( 0 );
				
				//controller1.standingMatrix = controls1.getStandingMatrix();
				controller1.position.set(0,1.6,0)
				controller1.rotateX(-Math.PI/3)
				controller1.updateMatrix()
				scene.add( controller1 );

				var loader = new THREE.OBJLoader();
				loader.setPath( 'models/obj/vive-controller/' );
				loader.load( 'vr_controller_vive_1_5.obj', function ( object ) {

					var loader = new THREE.TextureLoader();
					loader.setPath( 'models/obj/vive-controller/' );

					var controller = object.children[ 0 ];
					controller.material.map = loader.load( 'onepointfive_texture.png' );
					controller.material.specularMap = loader.load( 'onepointfive_spec.png' );

					controller1.add( object.clone() );

				} );
				// test Right Left
				
				var radius   = 0.02,
				segments = 32,
				materialR = new THREE.LineBasicMaterial( { color: 0xffcc00 } ),
				materialL = new THREE.LineBasicMaterial( { color: 0x0033cc } ),
				geometry = new THREE.CircleGeometry( radius, segments );
				var circleR = new THREE.Mesh(geometry, materialR ) 
				var circleL = new THREE.Mesh(geometry, materialL ) 
				circleR.position.set(0.1,0.05,-0.1)
				circleL.position.set(0,0.02,0.02)
				//circleR.updateMatrix()
				controller1.add(circleR)
		
					
				//


				effect = new THREE.VREffect( renderer );
				
				// test Vive control teleport
				controller1.userData.Interactions = new VIVECONTROLLER_Interaction()
				controller1.userData.Interactions.teleportationObjects = interactiveRoomObjs
				console.log(controller1)
				controller1.addEventListener( 'triggerdown', controller1.userData.Interactions.onTriggerDown );
				controller1.addEventListener( 'triggerup', controller1.userData.Interactions.onTriggerUp );

				renderer.domElement.addEventListener( 'mousedown', triggerControlStubDown, false)
				renderer.domElement.addEventListener( 'mouseup', triggerControlStubUp, false)
				renderer.domElement.addEventListener( 'mousemove', controllerMoveStub, false)					
				
				document.onkeydown = controllerMoveStub1;
}	
**/

function triggerControlStubUpAndMove() {

	var cP = camera.position
	
	//controller1.userData.Interactions.teleportPoint = new THREE.Vector3(cP.x+1.5, cP.y, cP.z+1.5)
	//controller1.dispatchEvent( { type: 'triggerup'} );

}

function triggerControlStubDown() {
	controller1.dispatchEvent( { type: 'triggerdown'} );
}
function triggerControlStubUp() {
	controller1.dispatchEvent( { type: 'triggerup'} );
}
function controllerMoveStub(e) {
	var PosX = ( event.clientX / window.innerWidth ) * 2 - 1;
	var cP = controller1.position
	controller1.position.set(PosX, cP.y,cP.z)
	controller1.updateMatrix()
	controller1.userData.Interactions.cleanIntersectedEmissive();
	controller1.userData.Interactions.intersectObjects( controller1 );
	
}
function controllerMoveStub1(event) {
	
	if(event.keyCode == 38) controller1.rotateX(10 * (Math.PI/180))
	if(event.keyCode == 40) controller1.rotateX(-10 * (Math.PI/180))	
	if(event.keyCode == 39) controller1.rotateY(-10 * (Math.PI/180))
	if(event.keyCode == 37) controller1.rotateY(10 * (Math.PI/180))
	controller1.updateMatrix()
	controller1.userData.Interactions.cleanIntersectedEmissive();
	controller1.userData.Interactions.intersectObjects( controller1 );
	render()
}
		
			