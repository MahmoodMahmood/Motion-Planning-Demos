/*
 *  <Path optimization functions>
 */
function rubberBandPass(path, obstacles, step_size, max_steps=10000) {
  let new_path = [path[0]]
  for (let i = 1; i < path.length - 1; i++) {
    let robot = new_path[new_path.length-1].copy()
    let done = false
    for (let j = 0; !done && j < max_steps; j++) {
      robot.stepToward(path[i+1], step_size)
      // if robot collides then point at path[i] cannot be optimized out
      if (robot.inCollision(obstacles)) {
        new_path.push(path[i])
        done = true 
      } else if (path[i+1].dist(robot) < 5) {
        // if we arrived at path[i+1] without a collision then we don't need path[i]
        done = true
      }
    }
  }
  // always need to keep the last point
  new_path.push(path[path.length-1])
  return new_path
}

function skipToTarget(path, obstacles, step_size) {
  let new_path = [path[path.length - 1]]
  let prev_temp_path = []
  let cur_target = path[path.length - 1]
  for (let i = path.length - 2; !done && i >= 0; i--) {
    let temp_path = [path[i]]
    let done = false
    for (let j = 0; !done && j < 1000; j++) {
      let robot = temp_path[temp_path.length - 1].copy()
      robot.stepToward(cur_target, step_size)
      // console.log("robot & stepping toward:")
      // console.log(robot)
      // console.log(new_path[new_path.length-1])
      temp_path.push(robot)
      if (robot.inCollision(obstacles)) {
        console.log("collision!")
        new_path = new_path.concat(prev_temp_path)
        new_path.push(path[i])
        done = true
      } else if (robot.dist(cur_target) < 10) {
        prev_temp_path = temp_path
        // for (let k = new_path.length - 1; k > 0; k--) {
        //   if (robot.dist(new_path[k]) < 5) {
        //     new_path.concat(temp_path.slice(k - (path.length - 1) + j, temp_path.length).reverse())
        //   }
        done = true
      }
    }
  }

  new_path = new_path.concat(prev_temp_path)
  return new_path
}

function optimizePath(path, obstacles, step_size) {
  if (!path) return []
  // return rubberBandPass(path, obstacles, step_size)
  return skipToTarget(path, obstacles, step_size)
}
/*
 *  </Path optimization functions>
 */

const car_config = { L: 30,
                     W: 15,
                     color: 'blue',
                     min_delta: -Math.PI/6,
                     max_delta: Math.PI/6
                   }

const point_config = { color: 'blue',
                       radius: 10
                     }

const canvas_width = 500
const canvas_height = 500
const tree_step_size = 10
const cell_point_limit = 200

// let target = new CarNode({x: 400, y: 340, theta: 0}, {...car_config}, null)
let target = new PointNode({x: 400, y: 450}, {...point_config}, null)
target.config.color = 'green'

let root = new CarNode({x: 30, y: 50, theta: Math.PI/6}, {...car_config}, null)
// let root = new PointNode({x: 30, y: 50}, {...point_config}, null)
root.config.color = 'orange'

let t = new Tree(root, canvas_width, canvas_height, cell_point_limit, tree_step_size)

let obstacles = [] // list of obstacles to avoid
let path = [] // path from root to target
let optimized_path = [] // optimized path from root to target
let clickLoc = null
let targetReposition = false // when true, user is clicking and dragging target node
let rootReposition = false // when true, user is clicking and dragging root node

let TEMP_NODE = null

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
    TEMP_NODE.config.color = 'red'
    TEMP_NODE.draw()
  }

  if (path) drawPath(path, point_color='orange', line_color='#CC7000', line_width=2)
  if (optimized_path) drawPath(optimized_path, point_color='red', line_color='red', line_width=4, point_width=15)
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
  if (path) path.forEach(n => n.config.color = 'orange')
}

function drawPath(path_to_draw, point_color, line_color, line_width, point_width) {
  for (let i = 0; i < path_to_draw.length; i++) {
    let p = path_to_draw[i]
    p.config.color = point_color
    if (point_width) p.config.radius = point_width
    if (i > 0) {
      strokeWeight(line_width)
      stroke(line_color)
      line(path_to_draw[i-1].x, path_to_draw[i-1].y, p.x, p.y)
    }
    p.draw()
  }
}

function optimize() {
  if (optimized_path.length > 0) {
    optimized_path = optimizePath(optimized_path, obstacles, tree_step_size)
  } else if (path.length > 0) {
    optimized_path = optimizePath(path, obstacles, tree_step_size)
  }
}