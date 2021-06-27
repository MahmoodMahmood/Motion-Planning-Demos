class PointRenderer {
    constructor() {
        this.vertical_bucket_size = 0.5
        this.current_bucket = -1.5
        this.render_buffer = 1
        this.x_range = [0, 0]
        this.z_range = [0, 0]
        this.clear_on_next = true
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

    clear_canvas(p5_canvas, width, height) {
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                p5_canvas.set(i, j, p5_canvas.color(0,0,0))
            }
        }
        this.clear_on_next = false
    }

    draw(p5_canvas, width, height) {
        if (this.clear_on_next) this.clear_canvas(p5_canvas, width, height)
        const cur_points = this.points_dict[this.current_bucket]
        const x_width = this.x_range[1] - this.x_range[0]
        const z_width = this.z_range[1] - this.z_range[0]
        if (cur_points) {
            for (let i = 0; i < cur_points.length; i++) {
                const x = ((cur_points[i][0] - this.x_range[0]) / x_width) * width
                const z = ((cur_points[i][2] - this.z_range[0]) / z_width) * height
                p5_canvas.set(x, z, p5_canvas.color('white'))
            }
        }
    }

    changeBucket(new_bucket) {
        this.current_bucket = new_bucket
        this.clear_on_next = true
    }
    
    getSketchMaker(p5_canvas) {
        const canvas_width = 300
        const canvas_height = 300
        p5_canvas.setup = function() {
            p5_canvas.createCanvas(canvas_width, canvas_height)
        }

        p5_canvas.draw = function() {
            p5_canvas.background(0)
            if (pr) {
                pr.draw(p5_canvas, canvas_width, canvas_height)
            }
            p5_canvas.updatePixels()
        }
    }
}