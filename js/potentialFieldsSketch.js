const canvas_width = 500
const canvas_height = 500
const point_config = {
    color: 'blue',
    radius: 10
}

let obstacles = [] // list of obstacles to avoid
let path = [] // path from root to target
let clickLoc = null
let targetReposition = false // when true, user is clicking and dragging target node
let rootReposition = false // when true, user is clicking and dragging root node

let target = new PointNode({ x: 400, y: 450 }, { ...point_config }, null)
target.config.color = 'green'

let root = new PointNode({ x: 30, y: 50 }, { ...point_config }, null)
root.config.color = 'orange'

let f = new PotentialField(target, obstacles, step_size=10)

function setup() {
    canvas = createCanvas(canvas_width, canvas_height)
    canvas.parent('sketch-holder');

    obstacles = [new Obstacle(-100, -100, canvas_width, 5), // top wall
    new Obstacle(-100, -100, 5, canvas_height), // left wall
    new Obstacle(canvas_width + 100, canvas_height + 100, 5, canvas_height - 5), // bottom wall
    new Obstacle(canvas_width + 100, canvas_height + 100, canvas_width - 5, 5) // right wall
    ]
    f.obstacles = obstacles
    
    // mouse click event handlers for canvas
    canvas.mousePressed(canvasMousePressed)
    canvas.mouseReleased(canvasMouseReleased)
}

function draw() {
    background(220)
    f.draw()
    target.draw()
    root.draw()
    obstacles.forEach(o => o.draw())

    if (keyIsDown(32)) {
        // console.log("+ f.getField(mouseX, mouseY))
        let force = f.getForce(root.x, root.y)
        step_size = 10
        root.x += force[0] * step_size
        root.y += force[1] * step_size
    }
    if (mouseIsPressed) {
        // move target node or root node if user is dragging it
        if (targetReposition) {
            if (keyIsDown(CONTROL)) {
                target.theta = atan2(mouseY - target.y, mouseX - target.x)
            } else {
                target.x = mouseX
                target.y = mouseY
            }
        } else if (rootReposition) {
            if (keyIsDown(CONTROL)) {
                root.theta = atan2(mouseY - root.y, mouseX - root.x)
            } else {
                root.x = mouseX
                root.y = mouseY
            }
        } else if (clickLoc) {
            rectMode(CORNERS)
            noFill()
            rect(clickLoc[0], clickLoc[1], mouseX, mouseY)
        }
    }
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