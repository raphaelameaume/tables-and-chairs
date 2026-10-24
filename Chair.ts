import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
	color: 0xffffff,
});

export class Chair extends THREE.Object3D {
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

		const seat = new THREE.Mesh(geometry, material);
		seat.scale.x = 0.45;
		seat.scale.y = 0.05;
		seat.scale.z = 0.35;

		const leg = new THREE.Mesh(geometry, material);
		leg.scale.x = 0.03;
		leg.scale.z = leg.scale.x;
		leg.scale.y = 0.45;
		leg.position.x = seat.scale.x * 0.5 - leg.scale.x * 0.5;
		leg.position.y = leg.scale.y * 0.5;
		leg.position.z = seat.scale.z * 0.5 - leg.scale.x * 0.5;

		const leg2 = leg.clone();
		leg2.position.z = -seat.scale.z * 0.5 + leg2.scale.x * 0.5;
		this.add(leg2);

		const leg3 = leg.clone();
		leg3.position.x = -seat.scale.x * 0.5 + leg.scale.x * 0.5;
		this.add(leg3);

		const leg4 = leg.clone();
		leg4.position.x = -seat.scale.x * 0.5 + leg4.scale.x * 0.5;
		leg4.position.z = -seat.scale.z * 0.5 + leg4.scale.x * 0.5;
		this.add(leg4);

		seat.position.y =
			leg.position.y + leg.scale.y * 0.5 + seat.scale.y * 0.5;

		this.add(seat);
		this.add(leg);

		const topLeg = leg.clone();
		topLeg.position.x = -seat.scale.x * 0.5 + topLeg.scale.x * 0.5;
		topLeg.position.y = leg.position.y + leg.scale.y + seat.scale.y * 0.5;
		topLeg.position.z = -seat.scale.z * 0.5 + topLeg.scale.x * 0.5;
		this.add(topLeg);

		const topLeg2 = topLeg.clone();
		topLeg2.position.x = seat.scale.x * 0.5 - topLeg2.scale.x * 0.5;
		topLeg2.position.y = leg.position.y + leg.scale.y + seat.scale.y * 0.5;
		topLeg2.position.z = -seat.scale.z * 0.5 + topLeg2.scale.x * 0.5;
		this.add(topLeg2);

		const back = new THREE.Mesh(geometry, material);
		back.scale.y = 0.1;
		back.scale.z = topLeg2.scale.z;
		back.scale.x = seat.scale.x * 1.1;
		back.position.y =
			topLeg.position.y + topLeg.scale.y * 0.5 - back.scale.y * 0.5;
		back.position.z = -seat.scale.z * 0.5 + back.scale.z * 0.5;

		this.add(back);

		const width = seat.scale.x;
		const height = topLeg.scale.y + leg.scale.y + seat.scale.y;
		const depth = seat.scale.z;

		this.bodyDesc = RAPIER.RigidBodyDesc.dynamic()
			.setTranslation(position.x, position.y, position.z)
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
		// 		wireframeLinewidth: 2,
		// 	}),
		// );
		// box.scale.set(width, height, depth);
		// box.position.y = box.scale.y * 0.5;
		// // this.add(box);
	}

	dispose() {
		this.removeFromParent();

		const children = [...this.children];

		children.forEach((child) => {
			child.removeFromParent();
		});
	}
}
