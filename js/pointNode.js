class PointNode extends AbstractNode {
  constructor(state, config, parent) {
    super(parent)
    this.x = state.x
    this.y = state.y
    this.config = config
  }

  dist(other) {
    return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2)
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

  copy() {
    return new PointNode({ x: this.x, y: this.y }, { ...this.config }, this.parent)
  }

  draw() {
    strokeWeight(1)
    stroke('black')
    fill(this.config.color)
    circle(this.x, this.y, this.config.radius)
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

  getRandomState(range) {
    return {
      x: Math.random() * range.x_max,
      y: Math.random() * range.y_max
    }
  }
}