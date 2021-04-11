class CircleBot {
    constructor(x, z, theta) {
        const radius = 0.2 // meters
        const initial_height = 0.15 // meters
        const distance_above_ground = 0 // meters

        this.x = x
        this.z = z
        this.theta = theta

        this.speed = 0
        this.y_vel = 0

        // THREE.js 3D model
        const cylinder_geometry = new THREE.CylinderGeometry(radius, radius, initial_height, 8)
        const cylinder_material = new THREE.MeshPhongMaterial({ color: 0x4287f5 })
        this.cylinder = new THREE.Mesh(cylinder_geometry, cylinder_material)
        this.cylinder.position.set(0, initial_height / 2 + distance_above_ground, 0)
        this.cylinder.castShadow = true

        const triangle_geometry = new THREE.BufferGeometry()
        const y_pos = initial_height + distance_above_ground + 0.01
        const triangle_vertices = new Float32Array([
            0, y_pos, radius * 0.8,
            radius * 0.8, y_pos, 0,
            0, y_pos, -radius * 0.8
        ])
        triangle_geometry.setAttribute('position', new THREE.BufferAttribute(triangle_vertices, 3))
        const triangle_material = new THREE.MeshBasicMaterial({ color: 0x2873c9 })
        this.triangle = new THREE.Mesh(triangle_geometry, triangle_material)

        this.triangle.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), this.theta)
        this.cylinder.position.set(this.x, this.cylinder.position.y, this.z)
        this.triangle.position.set(this.x, this.triangle.position.y, this.z)
    }

    // add or subtract delta to current orientation (theta)
    rotate(delta) {
        this.theta += delta
        this.theta %= 2 * Math.PI
        this.triangle.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), this.theta)
    }

    // moves forward in the current theta direction
    move(dist) {
        const c_t = Math.cos(this.theta)
        const s_t = Math.sin(this.theta)
        this.x += c_t * dist
        this.z -= s_t * dist
        this.cylinder.position.set(this.x, this.cylinder.position.y, this.z)
        this.triangle.position.set(this.x, this.triangle.position.y, this.z)
    }

    updateHeight(dist) {
        this.cylinder.position.set(this.x, this.cylinder.position.y + dist, this.z)
        this.triangle.position.set(this.x, this.triangle.position.y + dist, this.z)
    }

    collisionCheck(collidableMeshList) {
        for (let i = 0; i < this.cylinder.geometry.attributes.position.count; i++) {
            let local_vertex = this.cylinder.geometry.attributes.position.array.slice(i * 3, i * 3 + 3)
            let global_vertex = new THREE.Vector3(...local_vertex).sub(this.cylinder.position)
            let direction_vector = new THREE.Vector3(...local_vertex).multiplyScalar(-1)
            // console.log("g: " + global_vertex + ", d: " + direction_vector)
            // console.log(global_vertex)
            let raycaster = new THREE.Raycaster(global_vertex, direction_vector, 0.01, 1.0)
            const intersects = raycaster.intersectObjects(collidableMeshList);
            // console.log(intersects)
            if (intersects.length > 0) return true
        }
        return false
    }
}