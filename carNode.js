class CarNode {
  constructor(state, config, parent, color='blue') {
    this.x = state.x
    this.y = state.y
    this.theta = state.theta
    this.l = config.l
    this.w = config.w
    this.children = []
    this.parent = parent
    this.color = color
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
    return path.reverse()
  }

  draw() {
    strokeWeight(1)
    stroke('black')
    fill(this.color)
    circle(this.x, this.y, 10)
  }

  drawRecursive() {
    this.draw()
    this.children.forEach(c => {
      strokeWeight(1)
      stroke('black')
      line(this.x, this.y, c.x, c.y)
      c.drawRecursive()
    })
  }
  
  stepToward(target, step_size) {

  }

  inCollision(obstacles) {
    // TODO: add 3D check to this
    return obstacles.some(o => o.inObstacle(this.x, this.y));
  }
}

