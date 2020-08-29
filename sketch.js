class Node {
  constructor(x, y, parent) {
    this.x = x
    this.y = y
    this.children = []
    this.parent = parent
    this.color = 'blue'
  }

  addChild(node) {
    this.children.push(node)
  }

  getAllChildren() {
    // the map gets us an array for each of my children's children, need the .flat() to combine those arrays
    return this.children.concat(this.children.map(c => c.getAllChildren()).flat())
  }

  dist(x, y) {
    return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2)
  }

  getPathFromRoot() {
    let path = [this]
    while (path[path.length - 1].parent) {
      path.push(path[path.length - 1].parent)
    }
    return path
  }

  draw() {
    fill(this.color)
    circle(this.x, this.y, 10)
  }

  drawRecursive() {
    this.draw()
    this.children.forEach(c => {
      line(this.x, this.y, c.x, c.y)
      c.drawRecursive()
    })
  }
}

class Tree {
  constructor(root, canvas_width, canvas_height, cellPointLimit) {
    this.root = root
    this.boundary = new Rectangle(canvas_width / 2, canvas_height / 2, canvas_width / 2, canvas_height / 2)
    this.cellPointLimit = cellPointLimit
    this.qtree = new Quad(this.boundary, this.cellPointLimit)
  }

  getAllNodes() {
    return [this.root].concat(this.root.getAllChildren())
  }

  getNearbyNodes(x, y, radius) {
    let range = new Circle(x, y, radius)
    return this.qtree.query(range)
  }

  findNearestNode(x, y) {
    // https://stackoverflow.com/questions/8864430/compare-javascript-array-of-objects-to-get-min-max
    let radius = 10
    while (radius < min(this.boundary.w, this.boundary.h) * 2) {
      radius *= 2
      let nearbyNodes = this.getNearbyNodes(x, y, radius)
      if (nearbyNodes.length) {
        return nearbyNodes.reduce((prev, curr) => prev.dist(x, y) < curr.dist(x, y) ? prev : curr)
      }
    }
    return this.root
  }

  addNode(obstacles) {
    while (1) { // keep looping until we find a valid node to add
      const moveDist = 20
      let x = Math.random() * 400
      let y = Math.random() * 400
      // TEMP_NODE = new Node(x, y, null) // for visualization purposes
      // TEMP_NODE.color = 'red'

      // Core of RRT algorithm, see paper for details
      let nearestNode = this.findNearestNode(x, y)
      let diff_x = x - nearestNode.x
      let diff_y = y - nearestNode.y
      let mag = Math.sqrt(diff_x ** 2 + diff_y ** 2)

      let newNode = new Node(nearestNode.x + (moveDist / mag) * diff_x, nearestNode.y + (moveDist / mag) * diff_y, nearestNode)

      // make sure the new node is not in any obstacle, if it is then we retry everything
      if (obstacles.every(o => !o.inObstacle(newNode.x, newNode.y))) {
        nearestNode.addChild(newNode)
        this.qtree.insert(newNode);
        return newNode
      }
    }
  }

  findTarget(target, obstacles, maxNodes = 10, acceptable_range = 20) {
    let nearestNode = this.findNearestNode(target.x, target.y)
    if (nearestNode.dist(target.x, target.y) <= acceptable_range) {
      return nearestNode.getPathFromRoot()
    }

    for (let i = 0; i < maxNodes; i++) {
      let newNode = this.addNode(obstacles)
      if (newNode.dist(target.x, target.y) < acceptable_range) {
        return newNode.getPathFromRoot()
      }
    }
  }

  draw() {
    this.root.drawRecursive()
  }
}

class Obstacle {
  constructor(x1, y1, x2, y2) {
    const minL = 20
    this.x1 = x1
    this.y1 = y1
    // make sure width and height are at least minL units
    this.x2 = abs(x2 - x1) > minL ? x2 : x1 + (x2 - x1 > 0 ? 1 : -1) * minL
    this.y2 = abs(y2 - y1) > minL ? y2 : y1 + (y2 - y1 > 0 ? 1 : -1) * minL
    this.color = 'black'
  }

  inObstacle(x, y) {
    return ((x > this.x1 && x < this.x2) || (x > this.x2 && x < this.x1)) &&
      ((y > this.y1 && y < this.y2) || (y > this.y2 && y < this.y1))
  }

  draw() {
    rectMode(CORNERS)
    fill(this.color)
    rect(this.x1, this.y1, this.x2, this.y2)
  }
}

const canvas_width = 400
const canvas_height = 400
let TEMP_NODE = null // just an extra node we will draw in red for debugging purposes
let target = new Node(350, 350, null)
target.color = 'green'
let targetReposition = false // when true, use is clicking and dragging target node
let rootReposition = false // when true, user is clicking and dragging root node
const cellPointLimit = 6

let root = new Node(100, 200, null)
root.color = 'orange'
let t = new Tree(root, canvas_width, canvas_height, cellPointLimit)

let obstacles = [] // list of obstacles to avoid
let path = [] // path from root to target
let clickLoc = null

function setup() {
  canvas = createCanvas(canvas_width, canvas_height)
  canvas.parent('sketch-holder');
  obstacles = [new Obstacle(-100, -100, canvas_width, 5), // top wall
    new Obstacle(-100, -100, 5, canvas_height), // left wall
    new Obstacle(canvas_width + 100, canvas_height + 100, 5, canvas_height - 5), // bottom wall
    new Obstacle(canvas_width + 100, canvas_height + 100, canvas_width - 5, 5) // right wall
  ] 
  
  // mouse click event handlers for canvas
  canvas.mousePressed(canvasMousePressed)
  canvas.mouseReleased(canvasMouseReleased)
   
  // let path = t.findTarget(target, maxNodes=800, acceptable_range=10)
  // if (path) path.forEach(n => n.color = 'orange')
}

function draw() {
  background(220)
  if (t) {
    t.draw()
  }
  target.draw()
  root.draw()
  obstacles.forEach(o => o.draw())

  if (mouseIsPressed) {
    // move target node or root node if user is dragging it
    if (targetReposition) {
      target.x = mouseX
      target.y = mouseY
    } else if (rootReposition) {
      root.x = mouseX
      root.y = mouseY
    } else if (clickLoc) {
      rectMode(CORNERS)
      noFill()
      rect(clickLoc[0], clickLoc[1], mouseX, mouseY)
    }
  }

  if (TEMP_NODE) {
    TEMP_NODE.draw()
  }
  if (path) path.forEach(p => p.draw())
}

function canvasMousePressed() {
  if (abs(target.x - mouseX) <= 15 && abs(target.y - mouseY) <= 15) {
    targetReposition = true
    obstacles.length = 4
  } else if (abs(root.x - mouseX) <= 15 && abs(root.y - mouseY) <= 15) {
    rootReposition = true
    obstacles.length = 4
  } else {
    clickLoc = [mouseX, mouseY]
  }

  // reset RRT tree 
  t = null
  root.children = []
  path = []
  // return false to prevent default
  return false
}

function canvasMouseReleased() {
  if (!targetReposition && !rootReposition) {
    obstacles.push(new Obstacle(clickLoc[0], clickLoc[1], mouseX, mouseY))
  }
  clickLoc = null
  targetReposition = false
  rootReposition = false

  // return false to prevent default
  return false
}

function addPoint(pts) {
  if (!t) {
    t = new Tree(root, canvas_width, canvas_height, cellPointLimit)
  }
  path = t.findTarget(target, obstacles, maxNodes = pts, acceptable_range = 10)
  if (path) path.forEach(n => n.color = 'orange')
}