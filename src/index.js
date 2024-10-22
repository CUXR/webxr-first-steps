import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Text } from 'troika-three-text';
import { XR_BUTTONS } from 'gamepad-wrapper';
import { gsap } from 'gsap';
import { init } from './init.js';


const bullets = {};
const forwardVector = new THREE.Vector3(0, 0, -1);
const bulletSpeed = 10;
const bulletTimeToLive = 1;

const blasterGroup = new THREE.Group();
const targets = [];

let score = 0;
const scoreText = new Text();
scoreText.fontSize = 0.52;
scoreText.font = 'assets/SpaceMono-Bold.ttf';
scoreText.position.z = -2;
scoreText.color = 0xffa276;
scoreText.anchorX = 'center';
scoreText.anchorY = 'middle';

let laserSound, scoreSound;

function updateScoreDisplay() {
	const clampedScore = Math.max(0, Math.min(9999, score));
	const displayScore = clampedScore.toString().padStart(4, '0');
	scoreText.text = displayScore;
	scoreText.sync();
}

function setupScene({ scene, camera, renderer, player, controllers }) {
	// floor
	const floorGeometry = new THREE.PlaneGeometry(6, 6);
	const floorMaterial = new THREE.MeshStandardMaterial({color: 'white'});
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);	
	floor.rotateX(-Math.PI / 2);
	scene.add(floor);

	// cone
	const coneGeometry = new THREE.ConeGeometry(0.6, 1.5);
	const coneMaterial = new THREE.MeshStandardMaterial({ color: 'purple' });
	const cone = new THREE.Mesh(coneGeometry, coneMaterial);
	scene.add(cone);
	cone.position.set(0.4, 0.75, -1.5);

	// cube
	const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
	const cubeMaterial = new THREE.MeshStandardMaterial({ color: 'orange' });
	const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	scene.add(cube);
	cube.position.set(-0.8, 0.5, -1.5);
	cube.rotateY(Math.PI / 4);

	// sphere
	const sphereGeometry = new THREE.SphereGeometry(0.4);
	const sphereMaterial = new THREE.MeshStandardMaterial({ color: 'red' });
	const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	scene.add(sphere);
	sphere.position.set(0.6, 0.4, -0.5);
	sphere.scale.set(1.2, 1.2, 1.2);
}


// bullet
const bulletGeometry = new THREE.SphereGeometry(0.02);
const bulletMaterial = new THREE.MeshStandardMaterial({color: 'gray'});
const bulletPrototype = new THREE.Mesh(bulletGeometry, bulletMaterial);


// This function is called on every frame update
function onFrame(delta, time, {scene, camera, renderer, player, controllers}) {
	if (controllers.right) {
	  // Destructure the gamepad and raySpace from the right controller
	  const {gamepad, raySpace} = controllers.right;
	  // Check if the trigger button is pressed
	  if (gamepad.getButtonClick(XR_BUTTONS.TRIGGER)) {
		// Clone the bullet prototype
		const bullet = bulletPrototype.clone();
		scene.add(bullet);
		//The raySpace represents the XR controller’s ray-casting direction and position in 3D space.
		// Set bullet position and rotation to the raySpace
		raySpace.getWorldPosition(bullet.position);
		raySpace.getWorldQuaternion(bullet.quaternion);
	  }
	}
  }

init(setupScene, onFrame);
