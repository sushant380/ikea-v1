var mProx = new MATERIALPROXY() //Global
/** add support for only color as well? **/

function MATERIALPROXY() {
this.matProxy = [],
this.texturePath = "materials/texture/",
this.textureLoader = new THREE.TextureLoader(),
this.textureOnLoaded = function(texture) {
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

	// call rerender once the texture is loaded

	renderer.domElement.dispatchEvent(new Event('rerender'));
				
	return texture
},
this.textureOnProgress = function() {
		
},
this.textureOnError = function() {
		console.warn("Material/texture could not be loaded, using a white as default")
		renderer.domElement.dispatchEvent(new Event('rerender'));
},

this.getMaterial = function(mat) {
	/** check material proxy if it's already loaded and available **/
	var matObj
	if(mat.material!=undefined) matObj = this.getFromMaterialProxy(mat.material)
	else if(mat.texture!=undefined) matObj = this.getTexture(mat.texture)
	
	if(matObj==undefined || matObj.name==undefined) {
		matObj = this.getTexture("White.jpg")
	}
	return matObj
},

this.getTexture = function(textureName) {
	/** used to load a texture with out first defining the material **/
	
	// first check proxy
	var mat = this.getFromMaterialProxy(textureName)
	//
	if(mat==null) {
		var t = this.texturePath + textureName
		var texture = this.textureLoader.load(t, this.textureOnLoaded, this.textureOnProgress, this.textureOnError ) 	
	
		mat = new THREE.MeshLambertMaterial( {	// using MeshLambertMaterial as default
					 map:texture,
					 side:THREE.DoubleSide
                 }); 
		mat.name=textureName
		this.addToProxy(mat)
	}
	
	return mat	

	
},

this.addToProxy = function(matObj) {
	this.matProxy.push({"id": matObj.name, "matObj":matObj})
},

this.getFromMaterialProxy =  function(matId) {
	
	for(var i=0;i<this.matProxy.length;i++) {
		if(matId==this.matProxy[i].id) return this.matProxy[i].matObj.clone()
	}
	return null
}
return this
}