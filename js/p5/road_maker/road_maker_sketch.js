const [canvas_width, canvas_height] = [500, 500]
let path = new Path()
let car = null

function setup() {
  canvas = createCanvas(canvas_width, canvas_height)
  canvas.parent('sketch-holder');
}

function draw() {
  background(160)
  drawPath(path)
  drawCar(car)
  handleMouseEvents()
  checkAddCar()
  allignCarToPath()
}

function handleMouseEvents() {
  const queryRadius = 100
  if (mouseIsPressed && (path.tail == null || nodeDist(path.tail, mouseX, mouseY) > queryRadius)) {
    path.add(mouseX, mouseY)
  }
}

function allignCarToPath() {
  if (car == null || path.length == 0) { return }
  const queryRadius = 100
  let nearbyNodes = path.getNearbyNodes(car.x, car.y, queryRadius)
  let minNode = null
  let minDist = Infinity
  for (node of nearbyNodes) {
    let dist = nodeDist(node, car.x, car.y)
    if (dist < minDist) {
      minDist = dist
      minNode = node
    }
  }

  if (minNode != null && minNode.next != null) {
    car.theta = atan2(minNode.next.y - minNode.y, minNode.next.x - minNode.x)
  }
}

function checkAddCar() {
  if (car == null && path.length > 1) {
    car = new Car({ x: path.head.x, y: path.head.y, theta: 0 }, { color: 'red', L: 10, W: 5 })
  }
}