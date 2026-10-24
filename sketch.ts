import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

import type { Init, Rendering, Resize, Update } from "@fragment/types";
import { Table } from "./Table";
import { Chair } from "./Chair";
import { mapLinear } from "three/src/math/MathUtils";
import { Floor } from "./Floor";
import { World } from "@dimforge/rapier3d-compat";

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let orthoCamera: THREE.OrthographicCamera;
let orthoScene: THREE.Scene;
let resolution = new THREE.Vector2();
let rect: DOMRect | undefined;

let gravity = { x: 0.0, y: -9.81, z: 0.0 };
let world: World;
let counterTexture: THREE.CanvasTexture | null;

export const load = async () => {
	await RAPIER.init();

	world = new RAPIER.World(gravity);
};

let counterCanvas = document.createElement("canvas");
let counter: CanvasRenderingContext2D | null;
let count = 0;

const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();
const box = new THREE.Box3();

export const init: Init<"three"> = ({ canvas }) => {
	counter = counterCanvas.getContext("2d");

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x0000ff);

	orthoScene = new THREE.Scene();

	counterTexture = new THREE.CanvasTexture(counterCanvas);

	let mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(1, 1),
		new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: counterTexture,
			transparent: true,
		}),
	);
	orthoScene.add(mesh);

	camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
	camera.position.z = 6;
	camera.position.y = 2;
	camera.lookAt(new THREE.Vector3(0, 5, -30));
	camera.updateProjectionMatrix();

	orthoCamera = new THREE.OrthographicCamera(1, 1, 1, 1, 1, 1000);
	orthoCamera.position.z = 10;

	// let controls = new OrbitControls(camera, canvas);

	const floor = new Floor();
	// scene.add(floor);
	world.createCollider(floor.collider);

	const hit = new THREE.Mesh(
		new THREE.PlaneGeometry(1, 1, 32, 32),
		new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			wireframe: true,
		}),
	);
	hit.scale.x = 50;
	hit.position.z = -4;
	hit.scale.y = 20;
	hit.visible = false;

	const getMaxCount = () =>
		Math.floor(mapLinear(Math.random(), 0, 1, 15, 30));

	let maxCount = getMaxCount();

	let timeout: NodeJS.Timeout | undefined;

	const spawn = ({ position }: { position: THREE.Vector3 }) => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}

		if (Math.random() > 0.97) {
			count = maxCount;
		}

		if (count === maxCount) {
			maxCount = getMaxCount();
			count = 0;

			scene.children.forEach((child) => {
				const o = child as Table | Chair;

				if (o.body) {
					o.body.applyImpulse(
						{
							x:
								mapLinear(Math.random(), 0, 1, 1, 2) *
								3 *
								(Math.random() > 0.5 ? -1 : 1),
							y: mapLinear(Math.random(), 0, 1, 1, 2) * 3,
							z:
								mapLinear(Math.random(), 0, 1, 1, 2) *
								3 *
								(Math.random() > 0.85 ? -1 : 1),
						},
						true,
					);
				}
			});

			return;
		}

		const { PI } = Math;

		const rotation = new THREE.Euler(
			mapLinear(Math.random(), 0, 1, -PI * 0.5, PI * 0.5),
			mapLinear(Math.random(), 0, 1, -PI * 0.5, PI * 0.5),
			mapLinear(Math.random(), 0, 1, -PI * 0.5, PI * 0.5),
			"XYZ",
		);

		const obj = Math.random() > 0.2 ? Chair : Table;

		const t = new obj({
			position,
			rotation,
		});
		scene.add(t);

		t.body = world.createRigidBody(t.bodyDesc);
		t.collider = world.createCollider(t.colliderDesc, t.body);

		count++;

		timeout = setTimeout(
			() => {
				maxCount += count;
			},
			mapLinear(Math.random(), 0, 1, 1000, 3000),
		);
	};

	const target = new THREE.Vector2();
	const raycaster = new THREE.Raycaster();

	canvas.onpointerdown = (event) => {
		if (rect) {
			const x = mapLinear(event.pageX, rect.left, rect.right, -1, 1);
			const y = mapLinear(event.pageY, rect.top, rect.bottom, 1, -1);
			target.set(x, y);
			raycaster.setFromCamera(target, camera);

			const intersects = raycaster.intersectObject(hit);

			if (intersects.length > 0) {
				const firstHit = intersects[0];
				spawn({
					position: firstHit.point,
				});
			}
		}
	};

	scene.add(hit);

	const loop = () => {
		world.step();

		setTimeout(loop, 16);
	};

	loop();
};

const drawCount = ({ pixelRatio }) => {
	if (!counter) return;

	counter.clearRect(0, 0, counter.canvas.width, counter.canvas.height);
	const fontSize = counter.canvas.height * pixelRatio * 0.25;
	counter.fillStyle = "white";
	counter.font = `${fontSize}px monospace`;
	counter.textBaseline = "middle";
	counter.fillText(`${count}`, 20 * pixelRatio, counter.canvas.height * 0.5);

	if (counterTexture) {
		counterTexture.needsUpdate = true;
	}
};

const removeObject = (o: Table | Chair) => {
	if (o.body) {
		// also removes any colliders attached to this body
		world.removeRigidBody(o.body);
		o.body = undefined;
	}
	o.removeFromParent();
};

export const update: Update<"three"> = ({ renderer, pixelRatio }) => {
	drawCount({ pixelRatio });

	camera.updateMatrixWorld();
	projScreenMatrix.multiplyMatrices(
		camera.projectionMatrix,
		camera.matrixWorldInverse,
	);
	frustum.setFromProjectionMatrix(projScreenMatrix);

	// scene.children[0].rotation.x += (time / 1000) * 0.01;
	// scene.rotation.y += (deltaTime / 1000) * 0.5;
	// scene.children[0].rotation.z += (time / 1000) * 0.01;

	for (let i = scene.children.length - 1; i >= 0; i--) {
		const o = scene.children[i] as Table | Chair;
		if (!o.body) continue;

		// sync physics -> mesh
		const t = o.body.translation();
		const r = o.body.rotation();
		o.position.set(t.x, t.y, t.z);
		o.quaternion.set(r.x, r.y, r.z, r.w);

		// world-space bounds (works for Groups, not just single Meshes)
		o.updateMatrixWorld();
		box.setFromObject(o);

		if (!frustum.intersectsBox(box)) {
			removeObject(o);
		}
	}

	renderer.autoClear = true;
	renderer.render(scene, camera);

	renderer.autoClear = false;
	renderer.clearDepth();
	renderer.render(orthoScene, orthoCamera);
};

export const resize: Resize<"three"> = ({
	canvas,
	width,
	height,
	pixelRatio,
}) => {
	resolution.x = width * pixelRatio;
	resolution.y = height * pixelRatio;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	orthoCamera.left = -width * 0.5;
	orthoCamera.right = width * 0.5;
	orthoCamera.top = height * 0.5;
	orthoCamera.bottom = -height * 0.5;
	orthoCamera.updateProjectionMatrix(); // add this

	const h = 100;
	const m = orthoScene.children[0];
	counterCanvas.width = width * pixelRatio;
	counterCanvas.height = h * pixelRatio;

	if (counterTexture) {
		counterTexture.dispose();
	}

	counterTexture = new THREE.CanvasTexture(counterCanvas);
	m.material.map = counterTexture;
	drawCount({ pixelRatio });

	m.scale.x = width;
	m.scale.y = h;
	m.position.y = height * 0.5 - h * 0.5;

	rect = canvas.getBoundingClientRect();
};

export const rendering: Rendering = "three";
export const buildConfig = {
	resizing: "window",
	gui: false,
};
