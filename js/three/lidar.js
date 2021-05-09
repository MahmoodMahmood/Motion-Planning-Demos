// Source: https://stackoverflow.com/a/54024653/15428522
// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
function hsv2rgb(h,s,v) 
{                              
  let f = (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);     
  return [f(5),f(3),f(1)];       
}

class Lidar {
    constructor(position, rotation_matrix, n_phi=24, n_theta=8, range=5, min_phi=Math.PI/3, max_phi=Math.PI, min_theta=0, max_theta=Math.PI) {
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
                const raycaster = new THREE.Raycaster(this.position, direction_vector)
                const intersects = raycaster.intersectObjects(collidableMeshList);
                const index = (i*this.n_phi + j) * 3
                if (intersects.length > 0) { // add lidar hit to hits array
                    const pt = intersects[0].point
                    vertices[index] = pt.x
                    vertices[index + 1] = pt.y
                    vertices[index + 2] = pt.z
                    
                    const h = Math.min(270, Math.max(50, 270-pt.y*70))
                    let [r, g, b] = hsv2rgb(h, 1, 1)
                    colors[index] = r
                    colors[index + 1] = g
                    colors[index + 2] = b
                }
            }
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        // const material = new THREE.PointsMaterial({size: 0.1, color: new THREE.Color(1,0,0)});
        const material = new THREE.PointsMaterial({size: 0.1, vertexColors: true})
        this.points = new THREE.Points(geometry, material);
    }

    rotate(angle) {
        this.min_theta += angle
        this.max_theta += angle
    }
}