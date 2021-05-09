const canvas_width = 300
const canvas_height = 300

function setup() {
    canvas = createCanvas(canvas_width, canvas_height)
    canvas.parent('point-renderer-sketch-holder');
}

function draw() {
    background(0)
    if (pr) {
        pr.draw()
    }
    updatePixels()
}

class pointRenderer {
    constructor() {
        this.vertical_bucket_size = 0.5
        this.current_bucket = -1.5
        this.render_buffer = 1
        this.x_range = [0, 0]
        this.z_range = [0, 0]
        this.points_dict = {}
    }

    updateRange(x, z) {
        if (x - this.render_buffer < this.x_range[0]) {
            this.x_range[0] = x - this.render_buffer
        } else if (x + this.render_buffer > this.x_range[1]) {
            this.x_range[1] = x + this.render_buffer
        }

        if (z - this.render_buffer < this.z_range[0]) {
            this.z_range[0] = z - this.render_buffer
        } else if (z + this.render_buffer > this.z_range[1]) {
            this.z_range[1] = z + this.render_buffer
        }
    }

    // assumes positive y direction is up
    addThreeJSPoints(points) {
        let arr = points.geometry.attributes.position.array
        for (let i = 0; i < arr.length; i+=3) {
            const x = arr[i]
            const y = arr[i+1]
            const z = arr[i+2]
            this.updateRange(x,z)
            if (x == 0 && y == 0 && z == 0) {
                continue
            }
            const height_category = Math.floor(y / this.vertical_bucket_size) * this.vertical_bucket_size
            if (this.points_dict[height_category]) {
                this.points_dict[height_category].push(arr.slice(i, i+3))
            } else {
                this.points_dict[height_category] = [arr.slice(i, i+3)]
            }
        }
    }

    draw() {
        const cur_points = this.points_dict[this.current_bucket]
        const x_width = this.x_range[1] - this.x_range[0]
        const z_width = this.z_range[1] - this.z_range[0]
        if (cur_points) {
            for (let i = 0; i < cur_points.length; i++) {
                const x = ((cur_points[i][0] - this.x_range[0]) / x_width) * canvas_width
                const z = ((cur_points[i][2] - this.z_range[0]) / z_width) * canvas_height
                set(x, z, color('white'))
            }
        }
    }

    changeBucket(new_bucket) {
        this.current_bucket = new_bucket
        for (let i = 0; i < canvas_width; i++) {
            for (let j = 0; j < canvas_height; j++) {
                set(i, j, color(0,0,0))
            }
        }
    }
}