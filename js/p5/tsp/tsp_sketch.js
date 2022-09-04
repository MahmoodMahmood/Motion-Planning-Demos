const canvas_width = 500
const canvas_height = 500

let graph = new UndirectedGraph()

function setup() {
  canvas = createCanvas(canvas_width, canvas_height)
  canvas.parent('sketch-holder');
}

function draw() {
  background(220)
  graph.draw()
}
