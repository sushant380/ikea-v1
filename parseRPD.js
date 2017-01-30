/**
  case "Alt+Ctrl+Shift+R":
    h = e + "/UICore/Pages/VSRPDGetter.htm";

	
TODO, clean up code	
	**/

	
// end global vars
function swapZandY(v3) {
	for(var i=0;i<v3.length;i++) {
		var tY = v3[i].y
		var tZ = v3[i].z
		v3[i].y = tZ
		v3[i].z = tY 
	}
	return v3
}
function convertRPDCoordsToUnit(a) {

	return parseFloat(convertRPDCoordsToMM(a)/1000)
}

function convertRPDCoordsToMM(a) {
	return a/80
}
//////////////


function correctPointOrder(pointArr) {
//Create a new instance.

var convexHull = new ConvexHullGrahamScan();

//console.log("num in: " + pointArr.length)

for(var i=0;i<pointArr.length;i++) {
	//add points (needs to be done for each point, a foreach loop on the input array can be used.)
	convexHull.addPoint(pointArr[i].x, pointArr[i].y);
	//console.log("x: " + pointArr[i].x+ " y: " + pointArr[i].y)
	}

	//getHull() returns the array of points that make up the convex hull.
	var hullPoints = convexHull.getHull();
	//console.log("num out: " + pointArr.length)

	//for(var i=0;i<hullPoints.length;i++) {
	//	console.log("x: " + hullPoints[i].x+ " y: " + hullPoints[i].y)
	//}
	// check if we have some missing points we need to add back
	var missing = pointArr.filter(function(n) {
		for(var i=0;i<hullPoints.length;i++) {
//			console.log(n.x + " " + n.y)
			//if(n.x == 0 || n.y ==0){
			//	console.log("XY null")
			//	return false
			//}
			if (hullPoints[i].x == n.x && hullPoints[i].y == n.y) return false
		}
		return true;
	});
	
//	console.log(missing)
	// add missing back...
	
	//hullPoints=cleanRPDShapePoints(hullPoints)
	
	// angle....
	
	var Helper = new HELPERS()
	var straightAngles=[0,90,180,270,360]
	var mP = false


//	if(missing[0]!=undefined && missing[0].x!=undefined) {
	for(var j=0;j<missing.length;j++) {
		//if(j==2) break
		for(var i=0;i<hullPoints.length;i++) {
			var n = i+1
			if(i==hullPoints.length-1) n = 0
			
			var a1 = Helper.angle(hullPoints[i].x,hullPoints[i].y ,missing[j].x, missing[j].y)
			var a2 = Helper.angle(hullPoints[n].x,hullPoints[n].y ,missing[j].x, missing[j].y)
			a1 = (a1 * 180 / Math.PI)
			a2 = (a2 * 180 / Math.PI)

			var d1 = Helper.lineDistance(hullPoints[i], missing[j])
			var d2 = Helper.lineDistance(hullPoints[n], missing[j])
			var d3 = Helper.lineDistance(hullPoints[i], hullPoints[n])
				
			//a1 = Math.abs(a1)
			//a2 = Math.abs(a2)
//			console.log("filter " +j +" : " + a1 + " " + a2)
 
//			console.log("angle check")
//			console.log((Math.sqrt(d3*d3) +" "+Math.sqrt(d1*d1 + d2*d2)))
			if(Math.sqrt(d3*d3)==Math.sqrt(d1*d1 + d2*d2)) {
//			if(straightAngles.indexOf(a1)>-1 && straightAngles.indexOf(a2)>-1 && Math.abs(a1-a2)==90) {
//			console.log("First test: " + hullPoints[i].x+" "+missing[j].x+" "+hullPoints[n].y+" "+missing[j].y)		
					//mP=true
//					console.log("adding to :" + (i+1)) 	
					hullPoints.splice(n,0,{"x": missing[j].x, "y": missing[j].y})
					break
			}
			
		/**	if(hullPoints[i].y==missing[0].y && hullPoints[n].x==missing[0].x) {
			console.log("Second test: " + hullPoints[i].y+" "+missing[0].y+" "+hullPoints[n].x+" "+missing[0].x)		
					break
			} **/
			
		}
	}
	
	
//	if(mP) hullPoints.splice(i+1,0,{"x": missing[0].x, "y": missing[0].y})
	
//	console.log(hullPoints)

	return cleanRPDShapePoints(hullPoints)
}

function cleanRPDShapePoints(pA) {
	var cleanedPos = []
	var tolerance = 0.2 //should add a threashold of half wall width to get more corret alignment...


	for(var i = 0; i<pA.length; i++) {
		

		
		var a = pA[i-1], b = pA[i+1], c = pA[i]		
		
		if(i == 0) a = pA[pA.length-1]
		if(i == pA.length-1) b = pA[0]
	
	var distance = Math.abs((c.y - b.y)*a.x - (c.x - b.x)*a.y + c.x*b.y - c.y*b.x) / Math.sqrt(Math.pow((c.y-b.y),2) + Math.pow((c.x-b.x),2));
	
	//console.log(distance + " " + tolerance + " ax:" + a.x + "ay:"+a.y + " bx:" + b.x + "by:"+b.y + " cx:" + c.x + "cy:"+c.y )
	
    if (distance > tolerance){ 
		cleanedPos.push(c)
		continue }

    //test if the point c is between a and b
    var dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y)*(b.y - a.y)
    if(dotproduct < 0){ 		
		cleanedPos.push(c)
		continue  }

    var squaredlengthba = (b.x - a.x)*(b.x - a.x) + (b.y - a.y)*(b.y - a.y);
    if(dotproduct > squaredlengthba){ 		
		cleanedPos.push(c)
		continue  }

	}

	//check if shape is clockwise... else reverse

	//http://stackoverflow.com/questions/14505565/detect-if-a-set-of-points-in-an-array-that-are-the-vertices-of-a-complex-polygon
	var sum=0 // minus value is counter clockwise
		
	for(var i=0; i<cleanedPos.length;i++) {
		var n = (i + 1) % cleanedPos.length;
		
		//console.log((cleanedPos[n].x+" "+cleanedPos[i].x +" "+cleanedPos[n].y+" "+cleanedPos[i].y))

        sum += cleanedPos[i].x * cleanedPos[n].y;
        sum -= cleanedPos[n].x * cleanedPos[i].y;

	}
	if(sum>0) cleanedPos.reverse() // reverse to clockwise...
	
	return cleanedPos
}

///////////////////
function RPDtoJSON(rpd) {
	var rpdJSON = new Object()
	var decoded = decodeURIComponent(rpd)
	var t = rpdStringToArray(decoded, "&&")
	
	for(var i = 0; i<t.length; i++) {
		var r = rpdStringToArray(t[i], "==")
	
		if(r[0] == "RoomBaseData") {	// get room data
			rpdJSON[r[0]]=noNameParamsToJSON(r[1])
		}

		else if(r[0] == "AllItemData") {
			
			rpdJSON[r[0]]=noneUniqueParamsToJSON(r[1], 'item')
			
		}
		
		else if(r[0] == "AllWallData") {
			rpdJSON[r[0]]=noneUniqueParamsToJSON(r[1], 'wall')
			
		}
		
		else {
			rpdJSON[r[0]]=uniqueParamsToJSON(r[1])
		}
	}
	// extract and set global variables
	rpdJSON['AllRoomData']['CeilingHeight'] = convertRPDCoordsToUnit(rpdJSON['AllRoomData']['CeilingHeight']); // set the ceiling height

	//console.log(rpdJSON)
	
	return rpdJSON
}

function rpdStringToArray(rpdString, divideTooken) {
	return rpdString.split(divideTooken)
}

function uniqueParamsToJSON(a) { // assuming the params are unique for part
	var tempObj = new Object()
	var r = rpdStringToArray(a, "&")
		for(var i = 0; i<r.length; i++) {
			var b = rpdStringToArray(r[i], "=")
			tempObj[b[0]]=b[1]
		}
	return tempObj
}

function noNameParamsToJSON(a) { // need to return an object with arrays which is needed positions in room base data
	var r = rpdStringToArray(a, "&")
	var roomObj =  new Object()
	var coordArray = new Array()

		for(var i = 0; i<r.length; i++) {
		////console.log(r[i] + " is coord " + checkIfCoordString(r[i]))
		
		//intentionally ignoring the room type for now
		if(checkIfCoordString(r[i])) {	
			coordArray.push(createCoordsArray(r[i]))
			
	//		//console.log(coordTemp.x/1000 + ',0,'  +coordTemp.z/1000)
		}
		else roomObj['unknown'+i] =r[i]
		}
		roomObj['coords'] = coordArray
	return roomObj
	}

function createCoordsArray(str) {
	var coordTemp = new THREE.Vector3()			
	var coordAr = rpdStringToArray(str, " ")
	coordTemp.x = convertRPDCoordsToUnit(coordAr[0])	
	coordTemp.y = convertRPDCoordsToUnit(coordAr[1])
	coordTemp.z = convertRPDCoordsToUnit(coordAr[2])

	return coordTemp
}
function createOriArray(str) {

	var coordTemp = new THREE.Vector3()			
	var coordAr = rpdStringToArray(str, " ")
	
	//convert degree to radians
	//radians = degrees * (pi/180)
	coordTemp.x = parseFloat(coordAr[0]) * (Math.PI/180)
	coordTemp.y = parseFloat(coordAr[2]) * (Math.PI/180) //note swithing Y&Z orientation
	coordTemp.z = parseFloat(coordAr[1]) * (Math.PI/180)	
	
	return coordTemp
}
	
function noneUniqueParamsToJSON(a, tag) { // need to return an object with arrays which is needed for items
	var r = rpdStringToArray(a, ";")
	var retObj =  new Object()

		for(var i = 0; i<r.length; i++) {
				////console.log(r[i])
				var params=rpdStringToArray(r[i], "&")
				retObj[tag+i]={}
				for(var j = 0; j<params.length; j++) {
					var valuePair=rpdStringToArray(params[j], "=")
					
					//console.log(valuePair[0]+" "+valuePair[1])
				
					if(valuePair[0].indexOf("Ori")>-1 ) retObj[tag+i][valuePair[0]]=createOriArray(valuePair[1]) // orientation coords in degree
						
					else if(checkIfCoordString(valuePair[1]) && valuePair[0]!="Scl") {
						retObj[tag+i][valuePair[0]]=createCoordsArray(valuePair[1])						
					}
						
					else if(valuePair[0].indexOf("Pos")>-1 ) retObj[tag+i][valuePair[0]]=convertRPDCoordsToUnit(valuePair[1])	
				
					else retObj[tag+i][valuePair[0]]=valuePair[1]
					
				}
//				retObj[tag+i]
		}
	return retObj
	}

function checkIfCoordString(a) { // check if the string matches coords pattern with punctuations
//	var pattern = new RegExp("^[-]*\d+[.]\d+\s[-]*\d+[.]\d+\s[-]*\d+[.]\d+")
	pattern =  /^[-]*\d+[.]*\d*\s[-]*\d+[.]*\d*\s[-]*\d+[.]*\d*$/ // /^[-]*\d+[.]\d+\s[-]*\d+[.]\d+\s[-]*\d+[.]\d+/
	return pattern.test(a)
}

function getAllItemsBasedOnType(itemsOb, typeString, delWhenFound) {
	var foundItems = new Array()
	for(var Item in itemsOb) {
		for(var prop in itemsOb[Item]) {
			if(prop=="Type" && itemsOb[Item][prop].indexOf(typeString)==0) { //>-1) { // object marked as placed in wall
				//console.log(itemsOb[Item][prop])
				foundItems.push(itemsOb[Item]) 
				if(delWhenFound) delete itemsOb[Item]
			}
		}
	}
	return foundItems
}



function handleRPDItemZYs(itemArr) {
	// special for openings to swap the YZ values

	for(var i=0;i<itemArr.length;i++) {
		for(var item in itemArr[i]) {
			
			if(item=="Pos") {
				//itemArr[i][item] = 
				var tempAr = new Array(itemArr[i][item])
				var sw = swapZandY(tempAr) //itemArr[i][item].z = -itemArr[i][item].z
			}
		}
	}
	return itemArr
}

function mergeWHD(whdObj, dWHD) {
	
	
}

function cabItems(type,id, obj, whdObj,lstSlot,parentObj) {
	/** this should represent the logic of how the items in a cabinet is places since RPD data does not hold any internal positioning data **/ 
	
	/** TODO, add imperial calc and mapp to defaults **/
//	itemGeneric.call()

	//console.log(type+id+"_Shape" + " shape: " + obj[type+id+"_Shape"])
	id=(id===undefined?'':id);
	this.itemType=type.replace("_","")	
	this.name=obj["Item"]
	this.shape=obj[type+id+"_Shape"]
	this.Ori=obj[type+id+"_OriRel"]||{x:0,y:0,z:0};
	this.Pos=obj[type+id+"_PosRel"]||{x:0,y:0,z:0}
	this.color=obj[type+id+"_color"] || 0xFFFFFF
	
	this.showWireframe = true
	this.isFront = false			// in case we need adjust the front size later
	
	var patternHorizontal =  /[Horizontal]/ 
	this.isHorizontal = patternHorizontal.test(this.name) // in case we need to take this into account when placing the handles based on suffix
	
	
	this.slot=id
	this.maxSlot = (whdObj.h/(100/1000))
	
	//console.log("Getting Defaults for: " +this.itemType)
	//console.log(whdObj)
	var dWHD = getDefaultWHD(this, whdObj)
	//console.log("Result Defaults for: " +this.itemType + " " + dWHD.w + " "+ dWHD.h + " "+ dWHD.d)
	
	// test defaults
	this.w = dWHD.w //% whdObj.w
	this.h = dWHD.h //% whdObj.h
	this.d = dWHD.d //% whdObj.d
	
	if(obj[type+id+"_Suffix"]!=undefined) {
		this.shape=this.shape+obj[type+id+"_Suffix"]
		this.suffix = obj[type+id+"_Suffix"] // needed for handle positioning
	}
	
	
//	console.log(this)
	
	this.childItems = new Array()
	if(this.shape==undefined) return
	/**
	delete obj[type+id+"_Shape"]
	delete obj[type+id+"_OriRel"]
	delete obj[type+id+"_PosRel"]
	delete obj[type+id+"_Suffix"]
	**/
	
	var dA,dB,dD
		
	switch(type) {
		case "IKEA.Host.Vindrum60cm_dark_grey":
			var lstOccupiedSlot=id
			dA =new cabItems("FanExtractor",undefined, obj, whdObj,lstOccupiedSlot,this);
			//dB =new cabItems("FanFilter",0, obj, whdObj,lstOccupiedSlot,this);
			//dD =new cabItems("FanFlexiblePipe",undefined, obj, whdObj,lstOccupiedSlot,this);
			this.childItems.push(dA);
			//this.childItems.push(dB);
			//this.childItems.push(dD);
			break;
		case "Frame_":
			//
// TODO, create default hwd for objects
// should ideally be from models...
			/*var totalShapeItems=[];
			for(var shape in obj){
				if(shape.indexOf('_Shape')>-1){
					if(obj[shape]!==null && obj[shape]!=='null' && obj[shape]!==undefined){
						totalShapeItems.push(shape);
					}
				}
			}
			for(var j=0;j<totalShapeItems.length;j++){
				if(totalShapeItems[j].indexOf('DrawerFront')==-1 && totalShapeItems[j].indexOf('DrawerHandle')==-1 &&
					totalShapeItems[j].indexOf('CabHob')==-1 && totalShapeItems[j].indexOf('CabSink')==-1 && )
			}*/
			var lstOccupiedSlot=id
				

			for(var i=0;i<=this.maxSlot;i++) { // loop through all slots
			
			dA =new cabItems("DoorFrontA",i, obj, whdObj,lstOccupiedSlot,this)
			dB =new cabItems("DoorFrontB",i, obj, whdObj,lstOccupiedSlot,this)
			dA.name='DoorFrontA';	
				if(dB.shape==undefined && dA.shape!=undefined) {
					dA.Pos.z=whdObj.d/2		//in front		
					dA.Pos.y = (i * 100/1000) - whdObj.h/2
	//				console.log("SINGLE DOORS aw: " +dA.w)

					dA.isFront = true
					dA.isDoor = true
					
					dA.isVisibleFromOutside = true // for VR filtering
					
					this.childItems.push(dA)
					lstOccupiedSlot=id
					if(dA.name==='DoorFrontA'){
							//dA.Pos.y=-0.6;
					}
					
				}
				else if(dB.shape!=undefined && dA.shape!=undefined) {
					/** two doors so need to adjust the width and position for them **/
					dA.w=dB.w=dA.w/2
					dB.Pos.z=dA.Pos.z = whdObj.d/2		//in front		
					
					// need to check which door is placed on which side... not uniformed which door is placed where...
					
					if(dA.Pos.x>0) {
						dA.Pos.x = -dA.w/2
						dB.Pos.x = dA.w/2
					}
					else {
						dA.Pos.x = dA.w/2
						dB.Pos.x = -dA.w/2	
					}
					
					dA.Pos.y = (i * 100/1000) - whdObj.h/2
					dB.Pos.y = (i * 100/1000) - whdObj.h/2
					//
					
	//				console.log("DOUBLE DOORS aw: " +dA.w  +" bw: "+ dA.w)
					dA.isFront = true
					dB.isFront = true
					dA.isDoor = true
					dB.isDoor = true

					dA.isVisibleFromOutside = true// for VR filtering
					dB.isVisibleFromOutside = true// for VR filtering
					
					//dA.color= 0x000000
					//dB.color= 0x0000FF
					
					this.childItems.push(dA)
					this.childItems.push(dB)
					lstOccupiedSlot=id
					
				}

				dD = new cabItems("Drawer",i, obj, whdObj,lstOccupiedSlot,this)
				
				if(dD.shape!=undefined && dD.shape != 'null') {
					lstOccupiedSlot = i

					dD.Pos.y = (i * 100/1000) - whdObj.h/2		// based on the frame height
					
					dD.isVisibleFromOutside = false// for VR filtering
					this.childItems.push(dD)
				}
				
				
			
				
				else {
					dD = new cabItems("Shelf",i, obj, whdObj,lstOccupiedSlot,this)
					if(dD.shape!=undefined) {
						lstOccupiedSlot = i
						dD.d=dD.d-10/1000		
						dD.Pos.y = (i * 100/1000) - whdObj.h/2
				
						dD.isVisibleFromOutside = false// for VR filtering
						this.childItems.push(dD)
					}
					
					// special for horizontal wall cabinets which are not attached to a drawer but can share slots with shelfs...
					//else  {
//						console.log("INTO ELSE")
						/*dD = new cabItems("DrawerFront",i, obj, whdObj,lstOccupiedSlot,this)
						//console.log(dD.shape!=undefined)
						if(dD.shape!=undefined) {
						lstOccupiedSlot = i
		
						dD.Pos.y = (i * 100/1000) - whdObj.h/2 		// based on the frame height
						dD.Pos.z=whdObj.d/2
						
						
					//	console.log(dD)
						dD.isFront = true
						dD.isVisibleFromOutside = true// for VR filtering
						this.childItems.push(dD)
						}*/
					//}
				}
			//	console.log(i)
			}
			var frontShape=new cabItems('Front800Up',0,obj, whdObj,lstOccupiedSlot,this);
			if(frontShape.shape){
				frontShape.Pos.z=whdObj.d/2		//in front		
					frontShape.Pos.y = (1 * 100/1000) - whdObj.h/2
	//				console.log("SINGLE DOORS aw: " +dA.w)

					frontShape.isFront = true
					frontShape.isDoor = true
					
					frontShape.isVisibleFromOutside = true // for VR filtering
					
					this.childItems.push(frontShape)
					lstOccupiedSlot=id
					for(var b=0;b<this.childItems.length;b++){
						if(this.childItems[b].name==='DoorFrontA'){
							this.childItems[b].Pos.y=-0.6;
						}


					}
				
			}
			break;
		case "Drawer":
			var dA =new cabItems("DrawerFront",id, obj, whdObj,lstSlot,this)		
			if(dA.shape!==undefined){

			dA.Pos.z=whdObj.d/2-0.02;

			dA.isFront = true
			dA.isVisibleFromOutside = true// for VR filtering
			
			
				
			this.childItems.push(dA)		
		}
		var innerdA=new cabItems("InnerDrawerFront",id, obj, whdObj,lstSlot,this);		
			if(innerdA.shape!==undefined){
				innerdA.Pos.z=whdObj.d/2-0.02;
				//innerdA.isFront = true;
				//innerdA.isVisibleFromOutside = true;// for VR filtering
				this.childItems.push(innerdA)		
			}
			break;
		case "DrawerFront":
			var dA = new cabItems("DrawerHandle",id, obj, whdObj,lstOccupiedSlot,this)
			if(dA.shape!==undefined){
			
			//handle Ori & Pos inheritance
			var posInheritanceName = dA.itemType+"Position"+id+"_PosRel"
			var posInheritanceObj=obj[posInheritanceName]
			var oriInheritanceName = dA.itemType+"Position"+id+"_PosRel"
			var oriInheritanceObj=obj[oriInheritanceName]
			if(posInheritanceObj!=undefined) dA.Pos.addVectors(dA.Pos,posInheritanceObj)
			if(oriInheritanceObj!=undefined) dA.Ori.addVectors(dA.Ori,oriInheritanceObj)
			//
			
			dA.Pos.z=this.Pos.z + dA.Pos.z+dA.d //dA.d
			
	
			dA.isVisibleFromOutside = true// for VR filtering
			
			this.childItems.push(dA)
		}
			break
		
		
		case "CabWorktop_": 
			this.showWireframe = false
			
			var dOffset = Math.abs((this.d - whdObj.d)/2) // g_CABINETS_OTHER_DEFAULTS_METRIC["CabWorktop_Overhang"] //3cm hangover?

			this.Pos.z += dOffset/2
			this.Pos.y = whdObj.h/2
			this.isVisibleFromOutside = true// for VR filtering
			
			// test
			this.texture = "20161_personlig02a_01_14_light_oak_effect_PE513618.jpg"
						
			var cabHob =new cabItems("CabHob_",0, obj, whdObj,lstOccupiedSlot,this)		
			if(cabHob.shape!==undefined){
			//dA.w=dA.d=dA.d*0.8
			//dA.h=this.h + 0.02 // show with 2 cm over?
			cabHob.isVisibleFromOutside = true// for VR filtering			
			this.childItems.push(cabHob)
			}
			var cabHobSeparator=new cabItems('CabHobSeparator_',0,obj, whdObj,lstOccupiedSlot,this);
			if(cabHobSeparator.shape!==undefined){
			//dA.w=dA.d=dA.d*0.8
			//dA.h=this.h + 0.02 // show with 2 cm over?
			cabHobSeparator.isVisibleFromOutside = true// for VR filtering			
			this.childItems.push(cabHobSeparator);
			}
			var dA =new cabItems("CabSink",undefined, obj, whdObj,lstOccupiedSlot,this)		
			if(dA.shape!==undefined){
			dA.w=dA.d=dA.d*0.8
			//dA.h=this.h + 0.02 // show with 2 cm over?
			dA.isVisibleFromOutside = true// for VR filtering
			this.childItems.push(dA)
			}
			var ds =new cabItems("SinkTap",undefined, obj, whdObj,lstOccupiedSlot,this)		
			if(ds.shape!==undefined){
			//ds.w=ds.d=ds.d*0.8
			//ds.h=this.h + 0.02 // show with 2 cm over?
			ds.isVisibleFromOutside = true// for VR filtering
			this.childItems.push(ds)
			}
			break
		case "CabSink":
			
			break;
		case "DoorFrontA":
			var dA =new cabItems("DoorHandleA",id, obj, whdObj,lstOccupiedSlot,this)		
			if(dA.shape!==undefined){
			
			//handle Ori & Pos inheritance
			var posInheritanceName = "DoorHandlePositionA"+id+"_PosRel"
			var posInheritanceObj=obj[posInheritanceName]
			var oriInheritanceName = "DoorHandlePositionA"+id+"_OriRel"
			var oriInheritanceObj=obj[oriInheritanceName]
			if(posInheritanceObj!=undefined) dA.Pos.addVectors(dA.Pos,posInheritanceObj)
			if(oriInheritanceObj!=undefined) dA.Ori.addVectors(dA.Ori,oriInheritanceObj) 
			
			dA.Pos.z=this.Pos.z + dA.Pos.z 


			
//			dA.texture = "metal.jpg"
//			this.color=0x342103
			if(dA.suffix==='_LeftJustified'){
				this.opening="Right";
			}
			if(dA.suffix==='_RightJustified'){
				this.opening="Left";
			}
			dA.isVisibleFromOutside = true// for VR filtering
			this.childItems.push(dA)
			}			
			break
			
		case "DoorFrontB":
			var dA =new cabItems("DoorHandleB",id, obj, whdObj,lstOccupiedSlot,this)		
			if(dA.shape!==undefined){

			//handle Ori & Pos inheritance
			var posInheritanceName = "DoorHandlePositionB"+id+"_PosRel"
			var posInheritanceObj=obj[posInheritanceName]
			var oriInheritanceName = "DoorHandlePositionB"+id+"_OriRel"
			var oriInheritanceObj=obj[oriInheritanceName]
			if(posInheritanceObj!=undefined) dA.Pos.addVectors(dA.Pos,posInheritanceObj)
			if(oriInheritanceObj!=undefined) dA.Ori.addVectors(dA.Ori,oriInheritanceObj)
			//
						
			dA.Pos.z=this.Pos.z + dA.Pos.z
			if(dA.suffix==='_LeftJustified'){
				this.opening="Right";
			}
			if(dA.suffix==='_RightJustified'){
				this.opening="Left";
			}
			dA.isVisibleFromOutside = true// for VR filtering
			this.childItems.push(dA)
		}
			break;

		case "Plinth_":
			
			var leg0= new cabItems("Leg_",0, obj, whdObj,lstOccupiedSlot,this);
			//leg0.Pos.y=this.Pos.y;

			leg0.Pos.x=-whdObj.w/2+0.08;
			leg0.Pos.z=-0.05;
			leg0.Ori.y=180*(Math.PI/180);
			
			//leg0.Pos.y=-0.42;
			
			this.childItems.push(leg0);
			var leg1= new cabItems("Leg_",1, obj, whdObj,lstOccupiedSlot,this);
			leg1.Pos.x=whdObj.w/2-0.08;
			leg1.Pos.z=-0.05;
			leg1.Ori.y=0;
			this.childItems.push(leg1);
			var leg2= new cabItems("Leg_",2, obj, whdObj,lstOccupiedSlot,this);
			leg2.Pos.x=whdObj.w/2-0.08;
			leg2.Pos.z=-whdObj.d/2-0.1;
			leg2.Ori.y=0;
			this.childItems.push(leg2);
			var leg3= new cabItems("Leg_",3, obj, whdObj,lstOccupiedSlot,this);
			leg3.Pos.x=-whdObj.w/2+0.08;
			leg3.Pos.z=-whdObj.d/2-0.1;
			leg3.Ori.y=180*(Math.PI/180);
			this.childItems.push(leg3);

			var airvent=new cabItems('AirVent',undefined,obj, whdObj,lstOccupiedSlot,this);
			if(airvent.shape){
				this.childItems.push(airvent);
			}	

			
			}	
	
	return this
}

function postAdjustHandleBasedOnSuffix(obj) {

//	console.log(obj)
	//console.log(objdd)
	var handleDefaultSuffix = g_CABINETS_OTHER_DEFAULTS_METRIC["handleDefaultSuffix"]
	
	for(var i=0;i<obj.childItems.length;i++) {
		var cO =obj.childItems[i]
		if(cO.suffix!=undefined) {
		
		//if(cO.itemType=="DrawerHandle" && !cO.isHorizontal) cO.Pos.y=cO.Pos.y + (obj.h/2) - handleDefaultSuffix  //3cm från toppen.
		//else if(cO.itemType=="DrawerHandle" && cO.isHorizontal) cO.Pos.y=cO.Pos.y - (obj.h/2) + handleDefaultSuffix  //3cm från toppen.

		switch(cO.suffix) {
			case "_LeftJustified":
//			console.log("_LeftJustified, parent ") 
			
			cO.Pos.x = cO.Pos.x - (obj.w/2) + handleDefaultSuffix //+ cO.w
			//obj.Pos.x = obj.Pos.x + (parentObj.w/2) - handleDefaultSuffix - obj.w
			break
			case "_RightJustified":
			cO.Pos.x = cO.Pos.x + (obj.w/2) - handleDefaultSuffix //- cO.w
			//	obj.Pos.x = obj.Pos.x - (parentObj.w/2) + handleDefaultSuffix + obj.w
			break
		

		}
		
		//cO.texture = "metal.jpg"
		}
		
	}

}

//cabItems.prototype = new itemGeneric()
function itemGeneric() {
this.shape,
this.Ori,
this.Pos,
this.scale = new THREE.Vector3(0,0,0)
this.w,
this.h,
this.d,
this.color = 0xFFFFFF,
this.texture,
this.childItems = new Array(),
this.lockXTranslation = false,
this.lockYTranslation = false,
this.lockZTranslation = false

return this
}

function findSlotsInCabinet(cabBaseObj) {
	/** filter out all items that has been marked as a front. These then need to have adjusted heights **/
	var objWithSlots = new Array()
	
		if(cabBaseObj.isFront==true) objWithSlots.push(cabBaseObj)
	
		if(cabBaseObj.childItems==undefined) return objWithSlots
		var tempAr = []
		for(var i=0;i<cabBaseObj.childItems.length;i++) {
			 var re=findSlotsInCabinet(cabBaseObj.childItems[i])
			 
			 if(re.length>0)  {
				 objWithSlots = objWithSlots.concat(re)
			 }
		}
	return objWithSlots
}

function correctFrontHeights(cabBaseObj) {
/** adjust the fronts heights based on occupied slots **/

	var objWithSlots = findSlotsInCabinet(cabBaseObj)
		//console.log("objWithSlots " + cabBaseObj.name)
		//console.log(objWithSlots)
	
	var usedSlots = []
	if(objWithSlots.length>0) {
		
		usedSlots.push(objWithSlots[0].maxSlot)
		var maxSlot=objWithSlots[0].maxSlot

		
		for(var i=0;i<objWithSlots.length;i++) {
			if(usedSlots.indexOf(objWithSlots[i].slot)==-1)	usedSlots.push(objWithSlots[i].slot)
		}
	
		function sortNumber(a,b) {
			return a - b;
		}

		usedSlots.sort(sortNumber)
		usedSlots.reverse()
		//console.log(usedSlots)
	}
		
		for(var j=0;j<usedSlots.length-1;j++) {
			var curPos = usedSlots[j]
			var nextPos = usedSlots[j+1]
			
			var correctedHeight = (curPos-nextPos) * 0.1

			//console.log("front: " + nextPos+ " "+ curPos + " " +correctedHeight)
				
			for(var i=0;i<objWithSlots.length;i++) {
			if(objWithSlots[i].slot==nextPos) {
				objWithSlots[i].h = correctedHeight
				//console.log("OBJ POS: " + objWithSlots[i].Pos.y)
				var newYPos = objWithSlots[i].Pos.y + correctedHeight/2
			
				objWithSlots[i].Pos.y = parseFloat(objWithSlots[i].Pos.y) + correctedHeight/2 // ((nextPos+1)-(maxSlot/2))*0.1 + correctedHeight/2
				
				//now try to correct the handle position based on suffix info
				postAdjustHandleBasedOnSuffix(objWithSlots[i])	
				}
			
			}
		}

//			console.log("end correct front")
}

function itemExcluded(itemtype) {
	var ex =g_EXLUDED_OBJECTS
	if(ex[itemtype]) return true
	else return false
}

function mappAttributes(itemArr) {
	// I want to use other attribute names to make 3D more generic
	if(itemArr==undefined) return
	if(itemArr instanceof Object) {
		var itemsObjToAr = new Array()
		for(var Item in itemArr) {
			itemsObjToAr.push(itemArr[Item])
		}
		itemArr = itemsObjToAr
		//alert("is object")
	}
	
	var sceneItems = []
	
	for(var i=0;i<itemArr.length;i++) {
		
		/** check if item should be excluded **/
		if(itemExcluded(itemArr[i].Type)) continue
		
		
		
		for(var item in itemArr[i]) {
			
			if(item=="Item") {
				itemArr[i]["ItemName"] = itemArr[i][item] // set item name
				
				var correctedPositions = new Array(itemArr[i]["Pos"])
				swapZandY(correctedPositions)
				//				swapZandY(itemArr[i]["Pos"])

				// reverse Z value
				itemArr[i]["Pos"].z=-itemArr[i]["Pos"].z	
				
				if(itemArr[i][item].indexOf("cabinet")>-1 ) {
					var whd = getDefaultWHD(itemArr[i]) // estimate whd
				
					var cabBase = new cabItems("Frame_",0, itemArr[i], whd)
					cabBase.Pos=itemArr[i].Pos // move the Pos And Ori info
					cabBase.Ori=itemArr[i].Ori // move the Pos And Ori info
					cabBase.name = itemArr[i][item]
					
					//cabBase.texture= "roughness_map.jpg"
					
					// correct the heights of all doors and drawer fronts
					correctFrontHeights(cabBase)
					
					// add WT
					if(cabBase.childItems==undefined) cabBase.childItems = new Array()
					var cabTop=new cabItems("CabWorktop_",0, itemArr[i], whd);
					if(cabTop.shape){
						cabBase.childItems.push(cabTop);
					}
	
					//add Plint
					var plinthPos=new THREE.Vector3(0,-cabBase.h/2-0.05,cabBase.d/2-0.1);

					itemArr[i]["Plinth_0_PosRel"]=plinthPos;
					var plinth=new cabItems("Plinth_",0, itemArr[i], whd);
					if(plinth.shape!==undefined && plinth.shape!=='null'){
						cabBase.childItems.push(plinth);
					}
					
					var positionType = itemArr[i]["Type"]
					if(positionType.indexOf("OnFloor:")==0) cabBase.lockYTranslation=true 
					if(positionType.indexOf("OnWall+OnFloor:")==0) cabBase.lockYTranslation=true
					
//["CabHob","CabSink","DoorFront","DoorHandle","DrawerFront","DrawerHandle","Leg","CabWorktop","Plinth"]				
					
					if(itemArr[i]["Type"].indexOf("OnFloor:")>=0 || itemArr[i]["Type"].indexOf("OnWall:")>=0 || itemArr[i]["Type"].indexOf("OnWall+OnFloor:")) sceneItems.push(cabBase)

					
					
				}else if (itemArr[i][item].indexOf("IKEA.Host.Vindrum_60cm_dark_grey")>-1){
					var whd = getDefaultWHD(itemArr[i]) // estimate whd
				
					
					
					
					var cabBase=new cabItems("FanExtractor",undefined, itemArr[i], whd);
					cabBase.Pos=itemArr[i].Pos // move the Pos And Ori info
					cabBase.Ori=itemArr[i].Ori // move the Pos And Ori info
					cabBase.name = itemArr[i][item]
					
					/*var cabTop1=new cabItems("FanFilter_",0, itemArr[i], whd);
					if(cabTop1.shape){
						cabBase.childItems.push(cabTop1);
					}
					var cabTop2=new cabItems("FanFlexiblePipe",undefined, itemArr[i], whd);
					if(cabTop2.shape){
						cabBase.childItems.push(cabTop2);
					}*/

					//cabBase.texture= "roughness_map.jpg"
					
					// correct the heights of all doors and drawer fronts
					correctFrontHeights(cabBase)
					
					
					
					var positionType = itemArr[i]["Type"]
					if(positionType.indexOf("OnWall:")>-1){ 
						cabBase.lockZTranslation=true ;
						sceneItems.push(cabBase);
					}
					
				}
				else {		// unknown none mapped item
		/**			whd = {}
					whd.w = convertRPDCoordsToUnit(itemArr[i]["Width"]) || 0.4//convertRPDCoordsToUnit(itemArr[i]["Depth"]) || 0.4 	// Note that I'm using the Depth as widht here.
					whd.h = convertRPDCoordsToUnit(itemArr[i]["Height"]) || 0.4
					whd.d = convertRPDCoordsToUnit(itemArr[i]["Depth"]) || 0.4
					console.warn("UNKNOWN ITEM: " + whd.w +" "+ whd.h +" "+ whd.d +" ")
			**/		var whd = getDefaultWHD(itemArr[i]) // estimate whd
					var cabBase = new cabItems(itemArr[i]["Item"],0, itemArr[i], whd)
					cabBase["color"] = 0xFFFFFF
					cabBase["type"] = itemArr[i]["Type"]
					cabBase["Ori"] = itemArr[i]["Ori"]
					cabBase["Pos"] = itemArr[i]["Pos"]
					
					if(itemArr[i]["Type"]!=undefined && (itemArr[i]["Type"].indexOf("OnFloor:")>=0 || itemArr[i]["Type"].indexOf("OnWall:")>=0)) sceneItems.push(cabBase)

				}
			}
		}
	}
	return sceneItems
	

}

function getCabinetDefaults(itemName) {
	/** add Imperial logic as well.. **/
	//console.log("getCabinetDefaults" + itemName)
	//console.log(g_CABINETS_DEFAULTS_METRIC[cabType])
	for(var cabType in g_CABINETS_DEFAULTS_METRIC) {
		//console.log("getCabinetDefaults " + itemName + " " + cabType)
		if(itemName.indexOf(cabType)>-1) return g_CABINETS_DEFAULTS_METRIC[cabType]
	}
	
}

function getDefaultWHD(obj, parentWHD) {
	/** if it's a cabinet, lets calc the WHD for now as we do not have any models to play with **/
	
	/** 
		TODO, add handling for non-cabinet shapes which has their whd alreay in the RPD
	**/
	
	var itemName 
	//console.log(obj)
	if(obj.ItemName!=undefined) itemName = obj.ItemName //from mapp func
	else if(obj.itemType!=undefined) itemName = obj.itemType //from cabBase func
	//console.log(itemName)
	
	var itemDefaultWDH  =  getCabinetDefaults(itemName) //g_CABINETS_DEFAULTS_METRIC
	//console.log(itemDefaultWDH)




	if(itemDefaultWDH==undefined) {	
		itemDefaultWDH  =  getCabinetDefaults("unknown") // in case we don't get any defaults or have any models
		console.warn("Couldn't find default WHD for "+itemName+" so going with defaults")
	}

	// handle resizable items
	if (obj.Width!=undefined) itemDefaultWDH.w=convertRPDCoordsToUnit(obj.Width)
	if (obj.Height!=undefined) itemDefaultWDH.h=convertRPDCoordsToUnit(obj.Height)
	if (obj.Depth!=undefined) itemDefaultWDH.d=convertRPDCoordsToUnit(obj.Depth)
	//
	
	if(parentWHD==undefined) parentWHD  =  itemDefaultWDH // in case we don't have any defaults from parent
	
	var w,h,d,maxD=itemDefaultWDH.maxD
	
	//console.log(itemName + " " +itemDefaultWDH.w + " " +itemDefaultWDH.h + " " +itemDefaultWDH.d )
	
	w = (itemDefaultWDH.w==undefined ? parentWHD.w : itemDefaultWDH.w)
	h = (itemDefaultWDH.h==undefined ? parentWHD.h : itemDefaultWDH.h)
	d = (itemDefaultWDH.d==undefined ? parentWHD.d : itemDefaultWDH.d)
	
	wOffset = (itemDefaultWDH.wOffset==undefined ? 0 : itemDefaultWDH.wOffset)
	hOffset = (itemDefaultWDH.hOffset==undefined ? 0 : itemDefaultWDH.hOffset)
	dOffset = (itemDefaultWDH.dOffset==undefined ? 0 : itemDefaultWDH.dOffset)
	
	
	var a = itemName.split("_")
	if(a[1]!=undefined) {
		
		// check for W..H.. def..
		var pattern =  /[W]\d*[H]\d*/ 
		//console.log(a[2])
		
		var b =[]
		if(pattern.test(a[2])) {
			var c = a[2].split(/[whWH]/)
			b[0] = c[1]
			b[1] = c[2]
					}
		else {
			b = a[1].split("x")	// see if there is anything...
		}
	
		if(b[0]!=undefined && !isNaN(b[0])) w = (b[0]/100) 
		if(b[1]!=undefined && !isNaN(b[1])) d = (b[1]/100)
		if(b[2]!=undefined && !isNaN(b[2])) h = (b[2]/100)

		// looks like the name of the item sometimes are not following the normal naming standard...
		if(b[2]==undefined && b[1]!=undefined && b[1]/100>maxD) {
			h= b[1]/100
			d=maxD
		}
		

		
	}
	
		w = w + wOffset
		d = d + dOffset
		h = h + hOffset
		
	//	console.log(itemName + " w: " + w + " h: " + h + " d: " + d )
	//console.log(itemName +": wOffset :" + wOffset +"hOffset :" + hOffset +"dOffset :" + dOffset)

	return {"w":w, "h":h, "d":d}
	
}


function itemsOffsetPos(a,dir) {
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
}


						

