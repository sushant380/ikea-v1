// https://www.script-tutorials.com/webgl-with-three-js-lesson-5/

function SkyBox() {
//<!-- skybox shaders -->
//<script type="x-shader/x-vertex" id="sky-vertex">
var skyVertex = `
varying vec3 vWorldPosition;
void main() {
vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
vWorldPosition = worldPosition.xyz;
gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
//</script>
//<script type="x-shader/x-fragment" id="sky-fragment">
var skyFragment = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;
varying vec3 vWorldPosition;
void main() {
float h = normalize( vWorldPosition + offset ).y;
gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );
}`;
//</script>
//<!-- /skybox shaders -->

this.skyBox,
this.isEnabled = false,
this.drawShaderSkybox = function() {
// prepare ShaderMaterial without textures
var vertexShader = skyVertex, fragmentShader = skyFragment;
var uniforms = {
topColor: {type: "c", value: new THREE.Color(0x99ccff)}, bottomColor: {type: "c", value: new THREE.Color(0xffffff)}, //0055ff
offset: {type: "f", value: 0}, exponent: {type: "f", value: 2}
}
var skyMaterial = new THREE.ShaderMaterial({vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide, fog: false});
// create Mesh with sphere geometry and add to the scene
this.skyBox = new THREE.Mesh( new THREE.SphereGeometry(250, 60, 40), skyMaterial);
},

this.addSkyBox = function() {
	scene.add(this.skyBox);
	this.isEnabled = true
	render()
},
this.removeSkyBox = function() {
	scene.remove(this.skyBox);
	this.isEnabled = false
	render()
}

}