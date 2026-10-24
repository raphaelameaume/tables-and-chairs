import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

export class Floor extends THREE.Object3D {
	collider: RAPIER.ColliderDesc;

	constructor() {
		super();

		const floor = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1, 32, 32).rotateX(Math.PI * 0.5),
			new THREE.MeshBasicMaterial({
				color: 0xff0000,
				wireframe: true,
			}),
		);
		floor.scale.x = 50;
		floor.scale.z = 50;
		this.add(floor);

		this.collider = RAPIER.ColliderDesc.cuboid(
			floor.scale.x,
			0.1,
			floor.scale.z,
		);
	}
}
