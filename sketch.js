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
    strokeWeight(1)
    stroke('black')
    rectMode(CORNERS)
    fill(this.color)
    rect(this.x1, this.y1, this.x2, this.y2)
  }
}

/*
 *  <Path optimization functions>
 */
function rubberBandPass(path, obstacles, step_size, max_steps=10000) {
  let new_path = [path[0]]
  for (let i = 1; i < path.length - 1; i++) {
    let robot = new PointRobot(new_path[new_path.length-1])
    let done = false
    for (let j = 0; !done && j < max_steps; j++) {
      robot.stepToward(path[i+1], step_size)
      // if robot collides then point at path[i] cannot be optimized out
      if (robot.inCollision(obstacles)) {
        new_path.push(path[i])
        done = true 
      } else if (path[i+1].dist(robot.x, robot.y) < 5) {
        // if we arrived at path[i+1] without a collision then we don't need path[i]
        done = true
      }
    }
    // if (!done) {
    //   // unable to reach next node for some reason, add path[i] to be safe
    //   new_path.push(path[i])
    // }
  }
  // always need to keep the last point
  new_path.push(path[path.length-1])
  return new_path
}

function optimizePath(path, obstacles, step_size) {
  if (!path) return []
  return rubberBandPass(path, obstacles, step_size)
}

/*
 *  </Path optimization functions>
 */


const canvas_width = 400
const canvas_height = 400
const tree_step_size = 15
const cell_point_limit = 6

let TEMP_NODE = null // just an extra node we will draw in red for debugging purposes
let target = new Node(350, 350, null)
target.color = 'green'
let targetReposition = false // when true, user is clicking and dragging target node
let rootReposition = false // when true, user is clicking and dragging root node

let root = new Node(100, 200, null)
root.color = 'orange'
let t = new Tree(root, canvas_width, canvas_height, cell_point_limit, tree_step_size)

let obstacles = [] // list of obstacles to avoid
let path = [] // path from root to target
let optimized_path = [] // optimized path from root to target
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
  if (path) drawPath(path, point_color='orange', line_color='#CC7000', line_width=2)
  if (optimized_path) drawPath(optimized_path, point_color='purple', line_color='red', line_width=4)
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
  optimized_path = []
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
    t = new Tree(root, canvas_width, canvas_height, cell_point_limit, tree_step_size)
  }
  path = t.findTarget(target, obstacles, maxNodes = pts, acceptable_range = 10)
  if (path) path.forEach(n => n.color = 'orange')
}

function drawPath(path_to_draw, point_color, line_color, line_width) {
  for (let i = 0; i < path_to_draw.length; i++) {
    let p = path_to_draw[i]
    p.color = point_color
    if (i > 0) {
      strokeWeight(line_width)
      stroke(line_color)
      line(path_to_draw[i-1].x, path_to_draw[i-1].y, p.x, p.y)
    }
  }
}

function optimize() {
  if (optimized_path.length > 0) {
    optimized_path = optimizePath(optimized_path, obstacles, tree_step_size/5)
  } else if (path.length > 0) {
    optimized_path = optimizePath(path, obstacles, tree_step_size/5)
  }
}