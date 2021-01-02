function mod2pi(a) {
  while (a > 2*Math.PI || a < 0) {
    a += a < 0 ? 2*Math.PI : -2*Math.PI
  }
  return a
}

function fclamp(a, min_d, max_d) {
  return ((a < min_d ? min_d : a) > max_d ? max_d : (a < min_d ? min_d : a))
}

class CarNode extends AbstractNode {
  constructor(state, config, parent) {
    super(parent)
    this.x = state.x
    this.y = state.y
    this.theta = state.theta
    this.config = config
  }

  dist(other) {
    if (other instanceof CarNode) {
      return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2 + 1 * (mod2pi(other.theta) - mod2pi(this.theta)) ** 2)
    } else {
      return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2)
    }
  }

  stepToward(target, step_size) {
    // steering wheel angle in frenet frame
    let delta = mod2pi(Math.atan2(target.x, target.y) - this.theta)
    delta = fclamp(delta, this.config.max_delta, mod2pi(this.config.min_delta))

    // console.log("delta: " + delta)
    // console.log("target: x:"  + target.x + ", y: " + target.y + ", theta: " + target.theta)
    // console.log("x: " + this.x + ", y: " + this.y + ", theta: " + this.theta)

    this.x += (step_size * Math.cos(this.theta))
    this.y += (step_size * Math.sin(this.theta))
    this.theta += (step_size * Math.tan(delta) / this.config.L)
    this.theta = mod2pi(this.theta)
  }

  inCollision(obstacles) {
    return obstacles.some(o => o.inObstacle(this.x, this.y));
    // return false
  }

  copy() {
    return new CarNode({x: this.x, y: this.y, theta: this.theta}, {...this.config}, this.parent)
  }

  draw() {
    push()
    strokeWeight(1)
    stroke('black')
    fill(this.config.color)
    rectMode(CORNER)
    translate(this.x, this.y)
    rotate(this.theta + Math.PI/2)
    // our car has x and y at rear axle, rectMode(CORNER) assumes x and y are top left coordinates,
    // also theta is the angle from the horizon
    rect(-this.config.W/2, -this.config.L*0.9, this.config.W, this.config.L)
    fill('black')
    circle(0, 0, 5)
    pop()
    // front center of car
    // fill('yellow')
    // circle(this.x + this.config.L * Math.sin(this.theta), this.y - this.config.L * Math.cos(this.theta), 3)
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
      y: Math.random() * range.y_max,
      theta: Math.random() * 2.0 * Math.PI
    }
  }
}
