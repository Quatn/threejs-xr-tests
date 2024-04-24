var alpha, alpha0;
if(window.DeviceOrientationEvent) {
	window.addEventListener('deviceorientationabsolute', function(event) {
		alpha = -event.alpha;
		document.querySelector("#compass").innerHTML = "Compass heading:  " + -alpha.toFixed(0) + " (Click to reset)";
	});
}


import * as THREE from 'three';

import { BoxLineGeometry } from 'three/addons/geometries/BoxLineGeometry.js';
import { SphereGeometry } from 'three/addons/geometries/SphereGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';			
import { Font } from 'three/addons/loaders/FontLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

const clock = new THREE.Clock();

let container;
let camera, scene, raycaster, renderer;

let room, pathGroup, bubble, interactables;

let controller, controllerGrip;

let INTERSECTED;

let path;
let alert = 0;

const fontLoader = new FontLoader();
let VCRFontInfo = {fontObj: new Font(), fontLoader: fontLoader, fontPath: "./VCROSDMono.json"}; //Font for 3D text models
VCRFontInfo.fontObj.data = undefined;

let modelLoader;
modelLoader = new GLTFLoader();

let startButton;

let fControl; //test FirstPersonControls to see if it resets the camera's position

let camY, camY0;

init();
animate();

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x505050 );

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 30 );
	camera.position.set( 0, 1.6, 0 );
	scene.add( camera );

	room = new THREE.Group();
	pathGroup = new THREE.Group();
	interactables = new THREE.Group();
	bubble = new THREE.LineSegments(
		new SphereGeometry( 5, 14, 7, 0, 6.283185307179586, 3.81389348145801, 2.50070775225748),
		new THREE.LineBasicMaterial( { color: 0xbcbcbc, linewidth: 2} )
	);
	scene.add( room );
	scene.add( pathGroup );
	scene.add( bubble )

	scene.add( new THREE.HemisphereLight( 0xa5a5a5, 0x898989, 3 ) );

	const light = new THREE.DirectionalLight( 0xffffff, 3 );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );

	const geometry = new THREE.BoxGeometry( 0.15, 0.15, 0.15 ); //Can be used to create box meshes

	addText(bubble, "E", VCRFontInfo, {position: {x: 3, y: 1, z: 0}, rotation: {x:0, y: Math.PI / 2 * 3, z: 0} , scale: {x: 0.2, y: 0.2, z: 0.2} }, 0x024ff4);
	addText(bubble, "W", VCRFontInfo, {position: {x: -3, y: 1, z: 0}, rotation: {x:0, y: Math.PI / 2, z: 0} , scale: {x: 0.2, y: 0.2, z: 0.2} }, 0xf45702);
	addText(bubble, "N", VCRFontInfo, {position: {x: 0, y: 1, z: -3}, rotation: {x:0, y: 0, z: 0} , scale: {x: 0.2, y: 0.2, z: 0.2} }, 0x02f412);
	addText(bubble, "S", VCRFontInfo, {position: {x: 0, y: 1, z: 3}, rotation: {x:0, y: Math.PI, z: 0} , scale: {x: 0.2, y: 0.2, z: 0.2} }, 0xffffff);

//	addModel('./models/rose/scene.gltf', modelLoader, { position: {x: 0, y: 1, z: 0}, scale: {x: 3, y: 3, z: 3} })
//
//	addModel('./models/car_arrow/scene.gltf', modelLoader, { position: {x: 10, y: 1, z: 0}, scale: {x: 3, y: 3, z: 3} })
//	addModel('./models/directional_arrow/scene.gltf', modelLoader, { position: {x: -10, y: 1, z: 0}, scale: {x: 3, y: 3, z: 3} })
//
//	addModelWithOpacity('./models/arrow/scene.gltf', modelLoader, { position: {x: 0, y: 0, z: 0}, scale: {x: 0.2, y: 0.2, z: 0.2}, rotation: {x: 0, y: Math.PI/2, z: 0}}, 0.5)
//	addModelWithOpacity('./models/arrow/scene.gltf', modelLoader, { position: {x: 0, y: 0, z: 4}, scale: {x: 0.2, y: 0.2, z: 0.2}, rotation: {x: 0, y: Math.PI/2, z: 0}}, 0.5)
//	addModelWithOpacity('./models/arrow/scene.gltf', modelLoader, { position: {x: 0, y: 0, z: 8}, scale: {x: 0.2, y: 0.2, z: 0.2}, rotation: {x: 0, y: Math.PI/2, z: 0}}, 0.5)
//
//	addModelWithOpacity('./models/arrow/scene.gltf', modelLoader, { position: {x: 3, y: 0, z: 9}, scale: {x: 0.2, y: 0.2, z: 0.2}, rotation: {x: 0, y: Math.PI, z: 0}}, 0.5)
//	addModelWithOpacity('./models/arrow/scene.gltf', modelLoader, { position: {x: 7, y: 0, z: 9}, scale: {x: 0.2, y: 0.2, z: 0.2}, rotation: {x: 0, y: Math.PI, z: 0}}, 0.5)
//	addModelWithOpacity('./models/arrow/scene.gltf', modelLoader, { position: {x: 11, y: 0, z: 9}, scale: {x: 0.2, y: 0.2, z: 0.2}, rotation: {x: 0, y: Math.PI, z: 0}}, 0.5)
//
//	addModel('./models/rose/scene.gltf', modelLoader, { position: {x: 12, y: 1, z: 9}, scale: {x: 3, y: 3, z: 3} })

	raycaster = new THREE.Raycaster();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;
	container.appendChild( renderer.domElement );

	fControl = new FirstPersonControls(camera, renderer.domElement);

	//
	function onSelectStart() {

		this.userData.isSelecting = true;

	}

	function onSelectEnd() {

		this.userData.isSelecting = false;

	}

	controller = renderer.xr.getController( 0 );
	controller.addEventListener( 'selectstart', onSelectStart );
	controller.addEventListener( 'selectend', onSelectEnd );
	controller.addEventListener( 'connected', function ( event ) {

		this.add( buildController( event.data ) );

	} );
	controller.addEventListener( 'disconnected', function () {

		this.remove( this.children[ 0 ] );

	} );
	scene.add( controller );

	const controllerModelFactory = new XRControllerModelFactory();

	controllerGrip = renderer.xr.getControllerGrip( 0 );
	controllerGrip.add( controllerModelFactory.createControllerModel( controllerGrip ) );
	scene.add( controllerGrip );

	window.addEventListener( 'resize', onWindowResize );

	//

		startButton = XRButton.createButton( renderer, { 'optionalFeatures': [ 'depth-sensing', 'dom-overlay'], domOverlay: {root: document.getElementById('content')} }, resetCompass);
	document.body.appendChild( startButton );

	//console.log(room);
	
	camY = camera.rotation.y;
	camY0 = camY;
	alpha0 = alpha;
}

async function loadFontAndCreateTextPromise(text, fontLoader, pathToFont, fontObj) { //Funny code to solve some js shenanigans I wasn't able to solve
	let Out = undefined;

	let prom = new Promise( function(res, rej) {
		fontLoader.load(pathToFont, function ( response ) {
			fontObj.data = response.data;
			Out = createText(text, response);
		});
		setTimeout(() => res(Out), 500); //Wait 500ms so that the font can load
	});
	return prom;
}

async function createText(text, font) {
	return new TextGeometry(text, {font, 
		size: 1,
		depth: 0.2,
		curveSegments: 1,

		bevelThickness: 2,
		bevelSize: 1.5,
		bevelEnabled: false
	});
}

async function addText(toGroup,
	text, 
	fontInfo = {fontObj: undefined, fontLoader: undefined, fontPath: undefined}, 
	init = { position: {x: 0, y: 0, z: 0},  rotation: {x: 0, y: 0, z:0}, scale: {x: 0, y: 0, z:0}}, 
	color) {

	//default values
	if (init.position == undefined) init.position = {x: 0, y: 0, z: 0}
	if (init.rotation == undefined) init.rotation = {x: 0, y: 0, z: 0}
	if (init.scale == undefined) init.scale = {x: 1, y: 1, z: 1}

	let textGeo = undefined;

	if (fontInfo.fontObj.data == undefined) {
		await loadFontAndCreateTextPromise(text, fontInfo.fontLoader, fontInfo.fontPath, fontInfo.fontObj).then(result => textGeo = result);
		if (fontInfo.fontObj.data == undefined) return 1;
	}
	else {
		textGeo = createText(text, fontInfo.fontObj);
	}


	const textMesh = new THREE.Mesh( textGeo, new THREE.MeshLambertMaterial( { color: color } ) );
	textMesh.position.x = init.position.x;
	textMesh.position.y = init.position.y;
	textMesh.position.z = init.position.z;

	textMesh.rotation.x = init.rotation.x;
	textMesh.rotation.y = init.rotation.y;
	textMesh.rotation.z = init.rotation.z;

	textMesh.scale.x = init.scale.x;
	textMesh.scale.y = init.scale.y;
	textMesh.scale.z = init.scale.z;

	textMesh.userData.velocity = new THREE.Vector3();
	textMesh.userData.velocity.x = 0;
	textMesh.userData.velocity.y = 0;
	textMesh.userData.velocity.z = 0;

	toGroup.add( textMesh );
	return 0;
}

async function addModel(path, modelLoader, init = { position: {x: 0, y: 0, z: 0},  rotation: {x: 0, y: 0, z:0}, scale: {x: 0, y: 0, z:0}} ) {
	if (init.position == undefined) init.position = {x: 0, y: 0, z: 0}
	if (init.rotation == undefined) init.rotation = {x: 0, y: 0, z: 0}
	if (init.scale == undefined) init.scale = {x: 1, y: 1, z: 1}

	modelLoader.load( path, function ( gltf ) {
		let scene = gltf.scene;
		scene.position.x = init.position.x;
		scene.position.y = init.position.y;
		scene.position.z = init.position.z;

		scene.rotation.x = init.rotation.x;
		scene.rotation.y = init.rotation.y;
		scene.rotation.z = init.rotation.z;

		scene.scale.x = init.scale.x;
		scene.scale.y = init.scale.y;
		scene.scale.z = init.scale.z;

		room.add( scene );
	});
}


//I ain't gonna waste time here
async function addModelOnPath(path, modelLoader, init = { position: {x: 0, y: 0, z: 0},  rotation: {x: 0, y: 0, z:0}, scale: {x: 0, y: 0, z:0}} ) {
	if (init.position == undefined) init.position = {x: 0, y: 0, z: 0}
	if (init.rotation == undefined) init.rotation = {x: 0, y: 0, z: 0}
	if (init.scale == undefined) init.scale = {x: 1, y: 1, z: 1}

	modelLoader.load( path, function ( gltf ) {
		let scene = gltf.scene;
		scene.position.x = init.position.x;
		scene.position.y = init.position.y;
		scene.position.z = init.position.z;

		scene.rotation.x = init.rotation.x;
		scene.rotation.y = init.rotation.y;
		scene.rotation.z = init.rotation.z;

		scene.scale.x = init.scale.x;
		scene.scale.y = init.scale.y;
		scene.scale.z = init.scale.z;

		pathGroup.add( scene );
	});
}

async function addModelWithOpacity(path, modelLoader, init = { position: {x: 0, y: 0, z: 0},  rotation: {x: 0, y: 0, z:0}, scale: {x: 0, y: 0, z:0}}, opacity) {
	if (init.position == undefined) init.position = {x: 0, y: 0, z: 0}
	if (init.rotation == undefined) init.rotation = {x: 0, y: 0, z: 0}
	if (init.scale == undefined) init.scale = {x: 1, y: 1, z: 1}

	modelLoader.load( path, function ( gltf ) {
		let scene = gltf.scene;
		scene.position.x = init.position.x;
		scene.position.y = init.position.y;
		scene.position.z = init.position.z;

		scene.rotation.x = init.rotation.x;
		scene.rotation.y = init.rotation.y;
		scene.rotation.z = init.rotation.z;

		scene.scale.x = init.scale.x;
		scene.scale.y = init.scale.y;
		scene.scale.z = init.scale.z;

		gltf.scene.traverse((o) => {
			if (o.isMesh)  {
				o.material.transparent = true;
				o.material.opacity = opacity;
			}
		});

		room.add( scene );
	});
}


function buildController( data ) {

	let geometry, material;

	switch ( data.targetRayMode ) {

		case 'tracked-pointer':

			geometry = new THREE.BufferGeometry();
			geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
			geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

			material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );

			return new THREE.Line( geometry, material );

		case 'gaze':

			geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
			material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
			return new THREE.Mesh( geometry, material );

	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight);

}

//

	function animate() {

		renderer.setAnimationLoop( render );

	}

function render() {
	const delta = clock.getDelta() * 60;
	//resetCompass();
	//2onScreenConsoleLog("Room: " + room.rotation.y);
	//onScreenConsoleLog("Scene: " + scene.rotation.y);
	//onScreenConsoleVal("Cam Y", camera.rotation.y);
	//camera.rotation.x = 0;
	//camera.rotation.z = 0;
	//camera.rotation.y = window.camY * Math.PI / 360;
	//let CamEulerY = 2 * Math.atan();
	//onScreenConsoleLog("Cam x: " + camera.rotation.x);
	//onScreenConsoleLog("Cam y: " + camera.rotation.y);
	//onScreenConsoleLog("Cam z: " + camera.rotation.z);
	
	if (alert > 6) trackingWarnOn();

	camY = camera.rotation.y;
	if (renderer.xr.getSession() != undefined && camY0 != undefined && alpha0 != undefined) {
		onScreenConsoleVal1("delta Cam Y", (camY - camY0) );
		onScreenConsoleVal2("delta alpha", (alpha - alpha0).toFixed(2) );

		if (Math.abs(camY - camY0) == 0) {
			let deltaAlpha = Math.abs(alpha - alpha0);
			if (deltaAlpha > 3) {
				onScreenConsoleLog("Warning2");
				alert += 10;
			}
			else if (deltaAlpha > 0.8) {
				onScreenConsoleLog("Warning");
				alert += 1;
			}

		}
	}
	camY0 = camY;
	alpha0 = alpha;


	//room.rotation.y = alpha / 360 * Math.PI;
	//
	bubble.position.x = camera.position.x;
	bubble.position.z = camera.position.z;

	//onScreenConsoleLog("bub x" + bubble.position.y);
	//onScreenConsoleLog("bub y" + bubble.position.y);
	//onScreenConsoleLog("cam x" + camera.position.y);

	if ( controller.userData.isSelecting === true && false) {

		const cube = room.children[ 0 ];
		room.remove( cube );

		cube.position.copy( controller.position );
		cube.userData.velocity.x = ( Math.random() - 0.5 ) * 0.02 * delta;
		cube.userData.velocity.y = ( Math.random() - 0.5 ) * 0.02 * delta;
		cube.userData.velocity.z = ( Math.random() * 0.01 - 0.05 ) * delta;
		cube.userData.velocity.applyQuaternion( controller.quaternion );
		room.add( cube );

	}

	// find intersections

	raycaster.setFromXRController( controller );

	const intersects = raycaster.intersectObjects( interactables.children, false );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex( 0xff0000 );

		}

	} else {

		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

		INTERSECTED = undefined;

	}
	renderer.render( scene, camera );

}

// Keep cubes inside room
function flingCubeBack() {
	for ( let i = 0; i < room.children.length; i ++ ) {

		const cube = room.children[ i ];

		cube.userData.velocity.multiplyScalar( 1 - ( 0.001 * delta ) );

		cube.position.add( cube.userData.velocity );

		if ( cube.position.x < - 3 || cube.position.x > 3 ) {

			cube.position.x = THREE.MathUtils.clamp( cube.position.x, - 3, 3 );
			cube.userData.velocity.x = - cube.userData.velocity.x;

		}

		if ( cube.position.y < 0 || cube.position.y > 6 ) {

			cube.position.y = THREE.MathUtils.clamp( cube.position.y, 0, 6 );
			cube.userData.velocity.y = - cube.userData.velocity.y;

		}

		if ( cube.position.z < - 3 || cube.position.z > 3 ) {

			cube.position.z = THREE.MathUtils.clamp( cube.position.z, - 3, 3 );
			cube.userData.velocity.z = - cube.userData.velocity.z;

		}

		cube.rotation.x += cube.userData.velocity.x * 2 * delta;
		cube.rotation.y += cube.userData.velocity.y * 2 * delta;
		cube.rotation.z += cube.userData.velocity.z * 2 * delta;

	}
}

function resetCompass() {
	//scene.rotation.y = 0;
	//controller.rotation.y = 0;
	//camera.rotation.y = 0;
	//onScreenConsoleLog(camera);
	//camera.quaternion.set(0, 0, 0, camera.quaternion.w);
	//fControl.lookAt(1, 1, -3);
	onScreenConsoleLog("Compass Reset Done")
	//sButton.onclick();
	//camera.rotation.x = 0;
	//camera.rotation.y = 0;
	//camera.rotation.z = 0;
	if (renderer.xr.getSession() != undefined) renderer.xr.getSession().end();
	if (alert > 6) {
		alert = 0;
		trackingWarnOff();
	}
	room.rotation.y = alpha / 180 * Math.PI; //+ ((alpha < -180)? -camera.rotation.y : camera.rotation.y);
	pathGroup.rotation.y = room.rotation.y;
	interactables.rotation.y = room.rotation.y;
	bubble.rotation.y = room.rotation.y;

	//renderer.xr.getSession().start();
	//alert(alpha);
}

window.resetCompass = resetCompass;

function rotateY(toRot = {x: 0, y: 0, z: 0}, angle) {
	let c = Math.cos(angle), s = Math.sin(angle);
	return {x: toRot.x * c + toRot.z * s, y: toRot.y, z: toRot.z * c - toRot.x * s};
}

async function displayPath() {
	let in1 = document.querySelector("#startPoint"), in2 = document.querySelector("#endPoint");
	let startId = in1.value, endId = in2.value;
	const floorHeight = 3;
	console.log(startId + " " + endId);
	pathGroup.children = [];
	if (startId.length > 0 && endId.length > 0) {
		fetch("https://finnsapi.developvn.click/api/ShortestPath/" + startId + "\/" + endId + "\/")
		.then((res) =>  res.text())
		.then(async (text) => {
			let apiYield = JSON.parse(text);
			console.log(apiYield)
			let pathLength = apiYield.length;
			let alphaAngle = (360 - 309) / 180 * Math.PI;


			let parseStart = JSON.parse(apiYield[0].locationWeb);
			let parseEnd = JSON.parse(apiYield[pathLength - 1].locationWeb);
			let pathObj = {
				startPoint: {x: parseStart[0], y: apiYield[0].floorId, z: parseStart[1]},
				endPoint: {x: parseEnd[0], y: apiYield[pathLength - 1].floorId, z: parseEnd[0]},
				path: []
			}

			for (let i = 0; i < pathLength; i++) {
				let parse = JSON.parse(apiYield[i].locationWeb);
				//console.log(parse)
				pathObj.path.push( rotateY({x: parse[0] - pathObj.startPoint.x, y: floorHeight * (apiYield[i].floorId - pathObj.startPoint.y), z: - parse[1] + pathObj.startPoint.z}, alphaAngle) )
			}
			console.log(pathObj.path)
			
			onScreenConsoleVal1("From", apiYield[0].mappointName);
			onScreenConsoleVal2("To", apiYield[pathLength - 1].mappointName);

			let arrow;
			let prom = new Promise( function(res, rej) {
				modelLoader.load( "./models/arrow/scene.gltf", function ( gltf ) {
					arrow = gltf;
					//console.log(arrow);
				});
				setTimeout(() => res(arrow), 500); //Wait 500ms so that the model can load
			});

			await prom.then(result => { //Doesn't need to be then, but whatever
				result.scene.scale.x = 0.1;
				result.scene.scale.y = 0.2;
				result.scene.scale.z = 0.1;

				result.scene.traverse((o) => {
					if (o.isMesh)  {
						o.material.transparent = true;
						o.material.opacity = 0.5;
					}
				});
			} );

			console.log(arrow);

			const sphereGeometry = new THREE.SphereGeometry( 0.15, 13, 6 ); 
			const sphereMaterial = new THREE.MeshLambertMaterial( { color: 0x47eef7 } ); 
			const sphereMaterialYel = new THREE.MeshLambertMaterial( { color: 0xfcdd16 } ); 
			sphereMaterial.transparent = true;
			sphereMaterial.opacity = 0.5;
			sphereMaterialYel.transparent = true;
			sphereMaterialYel.opacity = 0.5;
			const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial ); 
			const sphere1 = new THREE.Mesh( sphereGeometry, sphereMaterialYel ); 
			//console.log(sphere)

			const linePoints = [];

			pathObj.path.forEach( function (item, ind) { 
				linePoints.push( new THREE.Vector3( item.x, item.y, item.z ) );
				let node = (item.y < floorHeight)? sphere.clone(): sphere1.clone();
				node.position.x = item.x;
				node.position.y = item.y;
				node.position.z = item.z;

				node.rotation.x = 0;
				node.rotation.y = 0;
				node.rotation.z = 0;

				

				if (ind + 1 < pathObj.path.length) {
					let distance = Math.sqrt( Math.pow(pathObj.path[ind + 1].x - item.x, 2) + Math.pow(pathObj.path[ind + 1].z - item.z, 2) );
					let numOfarrows = Math.floor(distance / 3);
					//let incDis = distance / (numOfarrows + 1);
					let incDisX = (pathObj.path[ind + 1].x - item.x) / (numOfarrows + 1), incDisZ = (pathObj.path[ind + 1].z - item.z) / (numOfarrows + 1);

					let angle =  Math.atan2( (pathObj.path[ind + 1].x - item.x), (pathObj.path[ind + 1].z - item.z) ) + Math.PI / 2;
					//console.log(numOfarrows);
					for (let i = 0; i < numOfarrows; i++) {
						let arrowCp = arrow.scene.clone();

						arrowCp.position.x = item.x + incDisX * (i + 1);
						arrowCp.position.y = item.y;
						arrowCp.position.z = item.z + incDisZ * (i + 1);

						arrowCp.rotation.x = 0;
						arrowCp.rotation.y = angle;
						arrowCp.rotation.z = 0;

						pathGroup.add( arrowCp );
					}
					//onScreenConsoleLog(ind);
					//console.log((pathObj.path[ind + 1].x - item.x) / (pathObj.path[ind + 1].z - item.z));
					//console.log((Math.atan2( (pathObj.path[ind + 1].x - item.x), (pathObj.path[ind + 1].z - item.z) ) * 180) / Math.PI)
				}

				pathGroup.add( node );
			});

			//linePoints.push( new THREE.Vector3( pathObj.endPoint.x, 0, pathObj.endPoint.z ) );

			const lineGeometry = new THREE.BufferGeometry().setFromPoints( linePoints );

			const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

			const line = new THREE.Line( lineGeometry, lineMaterial );

			//console.log(line);


			addModelOnPath('./models/map_point/scene.gltf', modelLoader, { position: pathObj.path[pathLength - 1], scale: {x: 0.1, y: 0.1, z: 0.1} })

			pathGroup.add( line );

			onScreenConsoleLog("Done loading path");
			
			console.log(room);
		})
		.catch((e) => console.error(e))
	}
	else {
		onScreenConsoleLog("<font color=\"\#FF0000\">Please input both start point and end point</font>");
	}
}


async function displayPath1() {
	let in1 = document.querySelector("#startPoint"), in2 = document.querySelector("#endPoint");
	let startId = in1.value, endId = in2.value;
	console.log(startId + " " + endId);
	if (startId.length > 0 && endId.length > 0) {
		fetch("https://vincture.csproject.org/api/ShortestPath/" + startId + "\/" + endId + "\/")
			.then((res) =>  res.text())
			.then(async (text) => {
				let apiYield = JSON.parse(text);
				let pathLength = apiYield.length;

				let parseStart = JSON.parse(apiYield[0].locationWeb);
				let parseEnd = JSON.parse(apiYield[pathLength - 1].locationWeb);
				let pathObj = {
					startPoint: {x: parseStart[0], y: apiYield[0].floorId, z: parseStart[1]},
					endPoint: {x: parseEnd[0], y: apiYield[pathLength - 1].floorId, z: parseEnd[0]},
					path: []
				}

				for (let i = 0; i < pathLength; i++) {
					let parse = JSON.parse(apiYield[i].locationWeb);
					console.log(parse)
					pathObj.path.push( {x: parse[0] - pathObj.startPoint.x, y: apiYield[i].floorId - pathObj.startPoint.y, z: parse[1] - pathObj.startPoint.z} )
				}
				console.log(apiYield);
				console.log(pathObj);
			})
			.catch((e) => console.error(e))
		}
	else {
		onScreenConsoleLog("<font color=\"\#FF0000\">Please input both start point and end point</font>");
	}
}

window.displayPath = displayPath;
