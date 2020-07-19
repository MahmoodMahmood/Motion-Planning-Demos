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
  constructor(x, y) {
    this.root = new Node(x, y, null)
    this.root.color = 'orange'
  }

  getAllNodes() {
    return [this.root].concat(this.root.getAllChildren())
  }

  getNearbyNodes(x, y, radius) {
    let range = new Rectangle(x, y, radius, radius)
    return qtree.query(range)
  }

  findNearestNode(x, y) {
    // https://stackoverflow.com/questions/8864430/compare-javascript-array-of-objects-to-get-min-max
    //return this.getAllNodes().reduce((prev, curr) => prev.dist(x, y) < curr.dist(x, y) ? prev : curr)
    let radius = 50
    for (let i = 1; i <= 5; i++) {
      let nearbyNodes = this.getNearbyNodes(x, y, radius * i)
      if (nearbyNodes.length)
        return nearbyNodes.reduce((prev, curr) => prev.dist(x, y) < curr.dist(x, y) ? prev : curr)
    }
    return this.root
  }

  addNode(obstacles) {
    while (1) { // keep looping until we find a valid node to add
      const moveDist = 20
      let x = Math.random() * 400
      let y = Math.random() * 400

      // TEMP_NODE = new Node(x,y, null) // for visualization purposes
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
        qtree.insert(newNode);
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

let t = new Tree(100, 200)

//Quad Tree initialization
let cellPointLimit = 4
let boundary = new Rectangle(canvas_width / 2, canvas_height / 2, canvas_width, canvas_height)
let qtree = new Quad(boundary, cellPointLimit)

let obstacles = []
let clickLoc = null

function setup() {
  canvas = createCanvas(canvas_width, canvas_height)
  canvas.parent('sketch-holder');
  obstacles = [new Obstacle(-100, -100, canvas_width, 5), // top wall
    new Obstacle(-100, -100, 5, canvas_height), // left wall
    new Obstacle(canvas_width + 100, canvas_height + 100, 5, canvas_height - 5), // bottom wall
    new Obstacle(canvas_width + 100, canvas_height + 100, canvas_width - 5, 5)
  ] // right wall

  // let path = t.findTarget(target, maxNodes=800, acceptable_range=10)
  // if (path) path.forEach(n => n.color = 'orange')
}

function draw() {
  background(220)
  t.draw()
  target.draw()
  obstacles.forEach(o => o.draw())

  if (mouseIsPressed) {
    rectMode(CORNERS)
    noFill()
    rect(clickLoc[0], clickLoc[1], mouseX, mouseY)
  }

  if (TEMP_NODE) {
    TEMP_NODE.draw()
  }
}

function mousePressed() {
  clickLoc = [mouseX, mouseY]

  // return false to prevent default
  return false
}

function mouseReleased() {
  obstacles.push(new Obstacle(clickLoc[0], clickLoc[1], mouseX, mouseY))
  clickLoc = null

  // return false to prevent default
  return false
}

function addPoint(pts) {
  let path = t.findTarget(target, obstacles, maxNodes = pts, acceptable_range = 10)
  if (path) path.forEach(n => n.color = 'orange')
}