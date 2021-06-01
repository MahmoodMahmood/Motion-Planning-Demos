class CircleBot {
    constructor(x, z, theta) {
        const radius = 0.2 // meters
        const robot_height = 0.15 // meters
        const distance_above_ground = 0.5 // meters

        this.x = x
        this.y = distance_above_ground
        this.z = z
        this.height = robot_height
        this.theta = theta

        this.speed = 0
        this.y_vel = 0

        this.create_cylinder(radius, robot_height)
        this.create_triangle(radius, robot_height)
        this.lidar = new Lidar(new THREE.Vector3(this.x, this.y, this.z), null)
    }

    create_cylinder(radius, robot_height) {
        // THREE.js 3D model
        const cylinder_geometry = new THREE.CylinderGeometry(radius, radius, robot_height, 8)
        const cylinder_material = new THREE.MeshPhongMaterial({ color: 0x4287f5 })
        this.cylinder = new THREE.Mesh(cylinder_geometry, cylinder_material)
        this.cylinder.castShadow = true
        this.cylinder.position.set(this.x, robot_height / 2 + this.y, this.z)
    }
    
    create_triangle(radius, robot_height) {
        const triangle_geometry = new THREE.BufferGeometry()
        const y_pos = robot_height + this.y + 0.01
        const triangle_vertices = new Float32Array([
            0, y_pos, radius * 0.8,
            radius * 0.8, y_pos, 0,
            0, y_pos, -radius * 0.8
        ])
        triangle_geometry.setAttribute('position', new THREE.BufferAttribute(triangle_vertices, 3))
        const triangle_material = new THREE.MeshBasicMaterial({ color: 0x2873c9 })
        this.triangle = new THREE.Mesh(triangle_geometry, triangle_material)
        this.triangle.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), this.theta)
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
        this.lidar.position.x = this.x
        this.lidar.position.z = this.z
    }

    updateHeight(dist) {
        this.y += dist
        this.lidar.position.y += dist
        this.cylinder.position.set(this.x, this.cylinder.position.y + dist, this.z)
        this.triangle.position.set(this.x, this.triangle.position.y + dist, this.z)
    }

    collisionCheck(collidableMeshList) {
        const collision_buffer = 0.1
        for (let i = 0; i < this.cylinder.geometry.attributes.position.count; i++) {
            let local_vertex = this.cylinder.geometry.attributes.position.array.slice(i * 3, i * 3 + 3)
            let global_vertex = new THREE.Vector3(...local_vertex).add(this.cylinder.position)
            let direction_vector = new THREE.Vector3(...local_vertex).normalize()
            let raycaster = new THREE.Raycaster(global_vertex, direction_vector, 0, 0.1)
            const intersects = raycaster.intersectObjects(collidableMeshList);
            if (intersects.length > 0) {
                return true
            }
        }
        return false
    }
}