
function RPDManager() {

this.setRPDBox = function() {
				
				/*var	RPDBoxConUI = "RPD: <br><textarea id=\"rpd\" value=\"\"></textarea>"
				RPDBoxConUI += "<br><button type=\"button\" class=\"btn btn-primary\" id=\"reload\" href=\"#\" >Update Room</button>"
				controlsUI.innerHTML+=RPDBoxConUI
*/
				/*var aa =this
				var a = function(){
					console.log()
					aa.setRPD()
					}
				
				
				if(document.getElementById('rpd').value.length<1)  {
					document.getElementById('rpd').innerHTML = RPD_Raw
					this.initRPD()
				}
				
				var reload = document.getElementById('reload')
				reload.onclick=a*/
				RPD_Raw=rpd_array[0].rpd;
				this.initRPD()
}


this.initRPD = function() {
				// parse and handle RPD
				//console.log("into initRPD")
				render()

				var convertedRPD = RPDtoJSON(RPD_Raw)

				convertedRPD['RoomBaseData']['coords'] =correctPointOrder(convertedRPD['RoomBaseData']['coords'])
				
				//convertedRPD['RoomBaseData']['coords'] = orderShapeArray.orderShapeArray(convertedRPD['RoomBaseData']['coords'])  // sort RPD room points
				
				myRoom = new ROOMBASE()
				myRoom.isMetric=convertedRPD['AllRoomData']['Room_Metric']
				myRoom.convertedRPD = convertedRPD
				myRoom.ceilingHeight = convertedRPD['AllRoomData']['CeilingHeight']
				//
				myRoom.roomPoints = convertedRPD["RoomBaseData"]["coords"]
				myRoom.shapeAxis.y = "y" // use Y instead of Z for room shape
				//
				myRoom.isMetric = convertedRPD['AllRoomData']['Room_Metric']
				myRoom.openingsArr = handleRPDItemZYs(getAllItemsBasedOnType(convertedRPD['AllItemData'], "InWall:", true)) //get all openings and reverse ZY
				
				//console.log(dsa)
				//myRoom.openingsArr = getAllItemsBasedOnType(convertedRPD['AllItemData'], "InWall:")
				
				myRoom.initRoom()
				
				myRoomItems = new ROOMITEMS()

				var allItems
				
				allItems = mappAttributes(convertedRPD['AllItemData'])
				//console.log(allItems)
				myRoomItems.items = allItems
								
				//func to correct pos
				myRoomItems.itemsOffsetPos = itemsOffsetPos 

				// attached collidable objects
				var collWalls = myRoom.allWallMeshes
				//collObj.push(myRoom.floorShape) // also watch out for floor
				//console.log(collObj)
				myRoomItems.collidableWalls = collWalls
				myRoomItems.collidableFloor = myRoom.floorShape.clone() // dont know why but had to clone it...
				//
				myRoomItems.scene = scene;
				myRoomItems.init();
				
					
				render();
				controls.object.position.set(
-0.11607159221143132,
2.0924870639128503,
6.038192222751323);

			//	camera.lookAt(scene.position);
			$('[data-toggle="tooltip"]').tooltip();   
				
		},
		
this.setRPD = function() {
				RPD_Raw = document.getElementById('rpd').value
			
				var element = document.getElementById("context");
				if(element!=undefined) 	element.parentNode.removeChild(element);
				if(RPD_Raw.length>1) {
				init();
				this.initRPD()
				
				}
			}

return this
}