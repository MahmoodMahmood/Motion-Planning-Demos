// TODO: move to math util function
function mod2pi(a) {
    while (a > 2 * Math.PI || a < 0) {
        a += a < 0 ? 2 * Math.PI : -2 * Math.PI
    }
    return a
}

class Lidar {
    constructor(position, rotation_matrix, n_phi, n_theta, range, min_phi=0, max_phi=Math.PI, min_theta=0, max_theta=Math.PI/4) {
        this.position = position
        this.rotation_matrix = rotation_matrix
        this.n_phi = n_phi
        this.n_theta = n_theta // around the robot (i.e. y-axis)
        this.range = range
        this.min_phi = min_phi
        this.max_phi = max_phi
        this.min_theta = min_theta
        this.max_theta = max_theta
        this.points = null
    }

    castRays(collidableMeshList) {
        let vertices = new Float32Array(this.n_phi * this.n_theta * 3)
        let colors = new Float32Array(this.n_phi * this.n_theta * 3)
        for (let i = 0; i < this.n_phi * this.n_theta * 3; i++) {
            vertices[i] = 0
            colors[i] = 0
        }

        for (let i = 0; i < this.n_phi; i++) {
            for (let j = 0; j < this.n_theta; j++) {
                const p = ((i / this.n_phi) * (this.max_phi - this.min_phi)) + this.min_phi
                const t = ((j / this.n_theta) * (this.max_theta - this.min_theta)) + this.min_theta
                const direction_vector = new THREE.Vector3(Math.sin(p)*Math.cos(t), Math.cos(p), Math.sin(p)*Math.sin(t))
                let raycaster = new THREE.Raycaster(this.position, direction_vector)
                const intersects = raycaster.intersectObjects(collidableMeshList);
                const index = (i*this.n_phi + j) * 3
                if (intersects.length > 0) { // add lidar hit to hits array
                    const pt = intersects[0].point
                    vertices[index] = pt.x
                    vertices[index + 1] = pt.y
                    vertices[index + 2] = pt.z

                    colors[index] = 1;
                    colors[index + 1] = 0;
                    colors[index + 2] = 0;
                }
            }
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({size: 0.1, color: new THREE.Color(1,0,0)});
        this.points = new THREE.Points(geometry, material);
    }

    rotate(angle) {
        this.min_theta = mod2pi(this.min_theta + angle)
        this.max_theta = mod2pi(this.max_theta + angle)
    }
}