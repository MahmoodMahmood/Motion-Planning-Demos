const [canvas_width, canvas_height] = [
  Math.min(700, window.innerWidth),
  Math.min(700, window.innerHeight / 2)
]

const car_config = {
  L: 14,
  W: 7,
  color: 'red',
  stroke: 'grey',
  min_delta: -Math.PI / 4,
  max_delta: Math.PI / 4
}

let path = new Path()
let car = null
let obstacles = []

function setup() {
  canvas = createCanvas(canvas_width, canvas_height)
  canvas.parent('sketch-holder');
}

// Main draw loop
function draw() {
  background(160)
  drawPath(path)
  drawCar()
  drawObstacles()
  handleMouseEvents()
  checkAddCar()
  allignCarToPath()
}

function selectedTool() {
  // We only care about the selected tool if there is only one disabled
  if (document.querySelectorAll('button.draw-tool:disabled').length == 0) { return null }
  return document.querySelector('button.draw-tool:disabled').innerText
}

function mouseOnCanvas() {
  return mouseX >= 0 && mouseX <= canvas_width && mouseY >= 0 && mouseY <= canvas_height
}

function handleMouseEvents() {
  if (!mouseIsPressed) {
    return
  }
  if (!mouseOnCanvas()) {
    unclickAllTools()
    return
  }
  if (selectedTool() == "Road") {
    addRoad()
  } else if (selectedTool() == "Obstacle") {
    addCircularObstacle()
  }
}

function addRoad() {
  const queryRadius = 10
  if (mouseIsPressed && mouseOnCanvas() && (path.tail == null || nodeDist(path.tail, mouseX, mouseY) > queryRadius)) {
    path.add(mouseX, mouseY)
  }
}

function addCircularObstacle() {
  if (obstacles.length > 0 && obstacles[obstacles.length - 1].inObstacle(mouseX, mouseY)) { return }
  obstacles.push(new CircularObstacle(mouseX, mouseY, 10))
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
    car = new CarNode({ x: path.head.x, y: path.head.y, theta: 0 }, { ...car_config }, null)
  }
}

function drawCar() {
  if (car == null) { return }
  car.draw()
}

function handleToolClicked(btn) {
  const tools = document.querySelectorAll('button.draw-tool')
  tools.forEach(t => t.disabled = false)
  btn.disabled = true
}

function unclickAllTools() {
  const tools = document.querySelectorAll('button.draw-tool')
  tools.forEach(t => t.disabled = false)
}

function drawObstacles() {
  obstacles.forEach(o => o.draw())
}