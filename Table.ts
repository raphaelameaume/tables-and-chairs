import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
	color: 0xffffff,
});

export class Table extends THREE.Object3D {
	bodyDesc: RAPIER.RigidBodyDesc;
	colliderDesc: RAPIER.ColliderDesc;
	body?: RAPIER.RigidBody;
	collider?: RAPIER.Collider;

	constructor({
		position = new THREE.Vector3(),
		rotation = new THREE.Euler(),
	}: {
		position?: THREE.Vector3;
		rotation?: THREE.Euler;
	}) {
		super();

		this.name = "table";
		this.position.copy(position);

		const top = new THREE.Mesh(geometry, material);
		top.scale.x = 1.6;
		top.scale.y = 0.06;
		top.scale.z = 0.9;

		const leg = new THREE.Mesh(geometry, material);
		leg.scale.x = 0.07;
		leg.scale.z = 0.07;
		leg.scale.y = 0.7;
		leg.position.x = top.scale.x * 0.5 - leg.scale.x * 0.5;
		leg.position.y = leg.scale.y * 0.5;
		leg.position.z = top.scale.z * 0.5 - leg.scale.x * 0.5;

		const leg2 = leg.clone();
		leg2.position.z = -top.scale.z * 0.5 + leg2.scale.x * 0.5;
		this.add(leg2);

		const leg3 = leg.clone();
		leg3.position.x = -top.scale.x * 0.5 + leg.scale.x * 0.5;
		this.add(leg3);

		const leg4 = leg.clone();
		leg4.position.x = -top.scale.x * 0.5 + leg4.scale.x * 0.5;
		leg4.position.z = -top.scale.z * 0.5 + leg4.scale.x * 0.5;
		this.add(leg4);

		top.position.y = leg.scale.y + top.scale.y * 0.5;

		this.add(top);
		this.add(leg);

		const width = 1.6;
		const height = leg.scale.y + top.scale.y;
		const depth = top.scale.z;

		this.bodyDesc = RAPIER.RigidBodyDesc.dynamic()
			.setTranslation(position.x, position.y + height * 0.5, position.z)
			.setRotation(new THREE.Quaternion().setFromEuler(rotation));

		this.colliderDesc = RAPIER.ColliderDesc.cuboid(
			width * 0.5,
			height * 0.5,
			depth * 0.5,
		);

		// const box = new THREE.Mesh(
		// 	geometry,
		// 	new THREE.MeshBasicMaterial({
		// 		color: 0x0000ff,
		// 		wireframe: true,
		// 	}),
		// );
		// box.scale.set(width, height, depth);
		// box.position.y = box.scale.y * 0.5;
		// this.add(box);
	}
}
