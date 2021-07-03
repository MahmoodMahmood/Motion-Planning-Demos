class GridRenderer {
    constructor(cell_size, num_x, num_z) {
        this.cell_size = cell_size
        this.num_x = num_x
        this.num_z = num_z
        this.grid = null
        console.log("num_x: " + num_x + ", num_z: " + num_z)
    }

    updateGridRenderer(grid) {
        this.grid = grid
    }
    
    draw(p5_canvas, canvas_width, canvas_height) {
        if (this.grid) {
            for (let i = 0; i < this.num_x; i++) {
                for (let j = 0; j < this.num_z; j++) {
                    p5_canvas.noStroke()
                    p5_canvas.fill(this.grid[i][j]*255)
                    p5_canvas.rect(
                        i*(canvas_width/this.num_x), 
                        j*(canvas_height/this.num_z), 
                        (canvas_width/this.num_x), 
                        (canvas_width/this.num_z)
                    );
                }
            }
        }
    }

    getSketchMaker(p5_canvas) {
        const canvas_width = 300
        const canvas_height = 300
        p5_canvas.setup = function() {
            p5_canvas.createCanvas(canvas_width, canvas_height)
        }

        p5_canvas.draw = function() {
            p5_canvas.background(0)
            if (gr) {
                gr.draw(p5_canvas, canvas_width, canvas_height)
            }
            p5_canvas.updatePixels()
        }
    }
}