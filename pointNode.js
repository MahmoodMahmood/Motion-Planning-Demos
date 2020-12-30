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
    return path.reverse()
  }

  stepToward(target, step_size) {
    let diff_x = target.x - this.x
    let diff_y = target.y - this.y
    let mag = Math.sqrt(diff_x ** 2 + diff_y ** 2)
    this.x = this.x + (step_size / mag) * diff_x
    this.y = this.y + (step_size / mag) * diff_y
  }

  inCollision(obstacles) {
    return obstacles.some(o => o.inObstacle(this.x, this.y));
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
}