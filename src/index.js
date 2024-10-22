import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Text } from 'troika-three-text';
import { XR_BUTTONS } from 'gamepad-wrapper';
import { gsap } from 'gsap';
import { init } from './init.js';

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



// Constants to control bullet behavior
const forwardVector = new THREE.Vector3(0, 0, -1);
const bulletSpeed = 10;
const bulletTimeToLive = 1;
const bullets = {};



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

		// Capture the controller's orientation in world space to determine the direction of the bullet
		const globalQuaternion = raySpace.getWorldQuaternion(bullet.quaternion);
		// Determine the direction in which the bullet will move based on the controller's orientation
		const directionVector = forwardVector
			.clone()
			.applyQuaternion(globalQuaternion);
		// Store custom data about the bullet, including its velocity and time to live
		bullet.userData = {
			velocity: directionVector.multiplyScalar(bulletSpeed),
			timeToLive: bulletTimeToLive,
		};
		// Keep track of the active bullet using its unique ID
		bullets[bullet.uuid] = bullet;


		// Iterate through all active bullets to update their positions and check their lifespan
		Object.values(bullets).forEach(bullet => {
			// Lifespan check: Each bullet’s TTL decreases over time. Once the TTL drops below zero, the bullet is removed from both the scene and the bullets object to free up resources and maintain performance.
			if (bullet.userData.timeToLive < 0) {
			  delete bullets[bullet.uuid]; // Remove the bullet from the bullets object
			  scene.remove(bullet); // Remove the bullet from the scene
			  return; // Exit the current iteration early
			}
			// Position update: The bullet’s position is updated by moving it along its velocity vector, scaled by delta (the time since the last frame). This makes the bullet move forward at the correct speed each frame.
			const deltaVec = bullet.userData.velocity.clone().multiplyScalar(delta); // Calculate the movement vector for this frame
			bullet.position.add(deltaVec); // Update the bullet's position
			bullet.userData.timeToLive -= delta; // Decrease the bullet's TTL by the time since the last frame
		  });
		
	  }
	}
  }

init(setupScene, onFrame);
