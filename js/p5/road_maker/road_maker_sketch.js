const [canvas_width, canvas_height] = [500, 500]
let path = new Path()

function setup() {
  canvas = createCanvas(canvas_width, canvas_height)
  canvas.parent('sketch-holder');

  // mouse click event handlers for canvas
  canvas.mousePressed(canvasMousePressed)
  canvas.mouseReleased(canvasMouseReleased)
}

function draw() {
  background(160)
  drawPath(path)
}

function canvasMousePressed() {
  console.log("canvasMousePressed")
}

function canvasMouseReleased() {
  path.add(mouseX, mouseY)
}