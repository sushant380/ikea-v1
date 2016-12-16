/** default spec for different items 
	- whd are for metrics defined in Meter
	- similar spec for INCHES might be needed if conversion of metric values will not work. I.e. TODO
	
	- note it's important that the most unique is spec before the less unique
**/

var g_EXLUDED_OBJECTS = {
	"OnWall:WallAccessory.Rail":true
}

var g_CABINETS_DEFAULTS_METRIC = {
	/**
		w,h,d = fixed default values which will only be overriden if any of them are missing from the itemname or from the parent item
				
		w,h,dOffset = will be plused with current value
	**/	
	"Basecabinet": 	{"w": 0.6,"h": 0.8, "d": 0.6,"maxD":0.6},
	"Highcabinet": 	{"w": 0.6,"h": 0.8, "d": 0.6,"maxD":0.6},
	"Wallcabinet": 	{"w": 0.6,"h": 0.8, "d": 0.37,"maxD":0.37},
	
	"Horizontal_wallcabinet": {"w": 0.6,"h": 0.8, "d": 0.37,"maxD":0.37},


	"DoorFrontA": 	{"wOffset": -0.003, "d": 0.016,"maxD":0.02},
	"DoorFrontB": 	{"wOffset": -0.003, "d": 0.016,"maxD":0.02}, 	
	"DoorHandleA": 	{"w": 0.1,"h": 0.05, "d": 0.05,"maxD":0.1}, 
	"DoorHandleB": 	{"w": 0.1,"h": 0.05, "d": 0.05,"maxD":0.1}, 
	
	"DrawerFront": 	{"wOffset": -0.003, "d": 0.016,"maxD":0.02}, 
	"DrawerHandle": {"w": 0.1, "h": 0.15, "d": 0.02,"maxD":0.50}, 

	"Drawer": 		{"wOffset": -0.003, "h": 0.016,"dOffset": -0.018,"maxD":0.6},
	"Shelf": 		{"wOffset": -0.003, "h": 0.018,"maxD":0.6},

	"CabWorktop": 	{"h": 0.038, "dOffset": 0.035,"maxD":0.635}, 
	"CabHob": 		{"h": 0.042,"hOffset": 0.02, "wOffset": -0.05, "dOffset": -0.10, "maxD":0.635 }, 
	"CabSink": 		{"h": 0.042,"hOffset": 0.02, "wOffset": -0.05,"dOffset": -0.10, "maxD":0.635}, 
	"Frame": 		{"maxD":0.6},
	
	"ResizableEndPanel":	 {"d": 0.01,"maxD":0.05}, // ?? not fully a part of a cabinet but addint it anyway

	"Resizable_Filler_Basecabinet_60": {"h": 0.6},
	"Resizable_Filler_Wallcabinet_100_high_ME": {"h":1},
	"Common.Resizable.WallPanel.Generic.Resizable": {"d": 0.01,"maxD":0.05}, //?? 
	
	"unknown": 		{"w": 0.6,"h": 0.8, "d": 0.6,"maxD":0.6}, // fallback..
}

var g_CABINETS_OTHER_DEFAULTS_METRIC = {
	"handleDefaultSuffix": 0.05
}

var g_CABINETS_HANDLES_POS_METRIC = {
	/** handle position offset
	- will use the estimated W and H for fronts to place handle correct
	**/
	"DoorHandleA_LeftJustified" :{"wOffset": -1},
	"DoorHandleA_RightJustified" :{},
	"DoorHandleA_CenterJustified" :{},	
	
	"DoorHandleB" :{},
	
	
	"DrawerHandle_LeftJustified":  {},
	"DrawerHandle_RightJustified":  {},
	"DrawerHandle_CenterJustified":  {},
}











