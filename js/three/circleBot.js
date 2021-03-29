class CircleBot {
    constructor(x, z, theta) {
        const radius = 0.2 // meters
        const height = 0.15 // meters
        const distance_above_ground = 0 // meters

        this.x = x
        this.z = z
        this.theta = theta

        // THREE.js 3D model
        const cylinder_geometry = new THREE.CylinderGeometry(radius, radius, height, 32)
        const cylinder_material = new THREE.MeshPhongMaterial({ color: 0x4287f5 })
        this.cylinder = new THREE.Mesh(cylinder_geometry, cylinder_material)
        this.cylinder.position.set(0, height / 2 + distance_above_ground, 0)
        this.cylinder.castShadow = true

        const triangle_geometry = new THREE.BufferGeometry()
        const y_pos = height + distance_above_ground + 0.01
        const triangle_vertices = new Float32Array([
            0,            y_pos, radius * 0.8,
            radius * 0.8, y_pos, 0,
            0,            y_pos, -radius * 0.8
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
}