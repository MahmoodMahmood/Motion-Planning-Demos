class CircleBot {
    constructor(x, y, theta) {
        const radius = 0.15 // meters
        const height = 0.15 // meters
        const distance_above_ground = 0.05 // meters

        this.x = x
        this.y = y
        this.theta = theta

        // THREE.js 3D model
        const cylinder_geometry = new THREE.CylinderGeometry(radius, radius, height, 32)
        const cylinder_material = new THREE.MeshPhongMaterial({ color: 0x4287f5 })
        this.cylinder = new THREE.Mesh(cylinder_geometry, cylinder_material)
        this.cylinder.rotation.set(Math.PI / 2, 0, 0)
        this.cylinder.position.set(0, 0, height / 2 + distance_above_ground)
        this.cylinder.castShadow = true

        const triangle_geometry = new THREE.BufferGeometry()
        const triangle_vertices = new Float32Array([
            0, -radius * 0.8, height + distance_above_ground + 0.01,
            radius * 0.8, 0, height + distance_above_ground + 0.01,
            0, radius * 0.8, height + distance_above_ground + 0.01
        ])
        triangle_geometry.setAttribute('position', new THREE.BufferAttribute(triangle_vertices, 3))
        const triangle_material = new THREE.MeshBasicMaterial({ color: 0x2873c9 })
        this.triangle = new THREE.Mesh(triangle_geometry, triangle_material)
    }

    // add or subtract delta to current orientation (theta)
    rotate(delta) {
        this.theta += delta
        this.theta %= 2 * Math.PI
        this.triangle.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), this.theta)
    }

    // moves forward in the current theta direction
    move(dist) {
        const c_t = Math.cos(this.theta)
        const s_t = Math.sin(this.theta)
        this.x += c_t * dist
        this.y += s_t * dist
        this.cylinder.position.set(this.x, this.y, this.cylinder.position.z)
        this.triangle.position.set(this.x, this.y, this.triangle.position.z)
    }
}