
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
				RPD_JSON=x2js.xml_str2json(rpd_array[0].items);
				this.initRPD();
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

				var shoppingcart='<div style="overflow: auto">	<table id="cart" class="table table-hover table-condensed">    				<thead>						<tr>							<th style="width:50%">Product</th>							<th style="width:10%">Price</th>							<th style="width:8%">Quantity</th>							<th style="width:22%" class="text-center">Subtotal</th>							<th style="width:10%"></th>						</tr>					</thead>					<tbody>';
				for(var i=0;i<RPD_JSON.xml.ItemList.Item.length;i++){
					var itmJson=RPD_JSON.xml.ItemList.Item[i];
					var itemHtml='<tr><td data-th="Product"><div class="row"><div class="col-sm-2 hidden-xs"><img src="'+itmJson.SmallImageUrl+'" alt="..." class="img-responsive"/></div><div class="col-sm-10"><h4 class="nomargin">'+itmJson.DisplayName+'('+itmJson.Description+' / '+itmJson._RetailerProductCode+')</h4><p>'+itmJson.Category+'</p></div></div></td><td data-th="Price">'+itmJson.UnitPrice+'</td><td data-th="Quantity">'+itmJson.Quantity+'</td><td data-th="Subtotal" class="text-center">'+itmJson.Price+'</td></tr>';
					shoppingcart=shoppingcart+itemHtml;
				}
				shoppingcart=shoppingcart+'</tbody>	<tfoot>	<tr><td/><td/><td><strong>Total</strong></td><td class="text-center"><strong>'+RPD_JSON.xml.ItemList.TotalPrice+'</strong></td></tr>	</tfoot></table></div>';
				var html=$(shoppingcart);
				$('#model-body').append(html);
				$('.collapse').on('show.bs.collapse', function () {
					var groupId = $(this).find('.grandparentIcon');
				  if (groupId) {
				    $(groupId).html('v');
				  }
				});

				$('.collapse').on('hide.bs.collapse', function () {
				  var groupId = $(this).find('.grandparentIcon');
				  if (groupId) {
				    $(groupId).html('>');
				  }
				});


				render();


			//	camera.lookAt(scene.position);
			$('[data-toggle="tooltip"]').tooltip();
			 /*$("#myModal").wizard({
            	exit:'Exit',
            	back:'Back',
            	next:'Next',
            	finish:'Finish',
                onfinish:function(){
                  	var color=$('.texture-group input:radio:checked').val();
                  	var shape=$('.btn-group input:radio:checked').val()
                    drawShape("I",color);
                }
            });*/
			 $('.selectpicker').selectpicker({

			 });
			$('#colorPalette').click(function(){
				$('#colorPanel').css({
						'position': 'absolute',
			            'left': $(this).offset().left-150,
			            'top': $(this).offset().top
					}).show();
			});


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
