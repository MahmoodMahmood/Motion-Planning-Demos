class GridRenderer {
    constructor() {
    }
    
    draw(p, width, height) {
    }

    getSketchMaker(p) {
        const canvas_width = 300
        const canvas_height = 300
        p.setup = function() {
            p.createCanvas(canvas_width, canvas_height)
        }

        p.draw = function() {
            p.background(0)
            if (gr) {
                gr.draw(p, canvas_width, canvas_height)
            }
            p.updatePixels()
        }
    }
}