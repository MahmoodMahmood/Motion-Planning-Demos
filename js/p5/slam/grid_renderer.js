class GridRenderer {
    constructor(cell_size, num_x, num_z) {
        this.cell_size = cell_size
        this.num_x = num_x
        this.num_z = num_z
        this.grid = null
    }

    updateGrid(grid) {
        this.grid = grid
    }
    
    draw(p5_canvas) {
        if (this.grid) {
            for (let i = 0; i < this.num_x; i++) {
                for (let j = 0; j < this.num_z; j++) {
                    p5_canvas.fill(grid[i][j])
                    p5_canvas.rect(i*this.cell_size, j*this.cell_size, this.cell_size, this.cell_size);
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
                gr.draw(p5_canvas)
            }
            p5_canvas.updatePixels()
        }
    }
}