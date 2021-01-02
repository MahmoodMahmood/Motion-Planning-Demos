function mod2pi(a) {
  while (a > 2*Math.PI || a < 0) {
    a += a < 0 ? 2*Math.PI : -2*Math.PI
  }
  return a
}

/*
 * clamp an angle within a certain magnitude with wrap around considerations
 * ex: if a = 5PI/6 and a_max = 11PI/12, a_min = -11PI/12, we return a_min
 * explanation: 5PI/6 is closer to a_min after wrap around so we return a_min
 */
function angleClamp(a, a_min, a_max) {
  let temp = mod2pi(a)
  
  if (temp > Math.PI) {
    temp -= 2 * Math.PI
  }

  if (temp < a_max && temp > a_min) {
    return a
  } else if (temp > a_max) {
    return a_max
  } else if (temp < a_min) {
    return a_min
  }
}

function crossTrackError(x_start, y_start, x_dest, y_dest, theta_dest) {
  let m = Math.tan(theta_dest) // slope of destination theta
  let b = y_dest - x_dest * m // y intercept of line going through destination with the same theta

  // distance between point and line with eqn: y = mx + b
  // source: https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
  return Math.abs(b - m*x_start - y_start) / Math.sqrt(1 + m**2) * (y_start > y_dest ? -1 : 1)
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
      return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2 + 0.5 * (mod2pi(other.theta) - mod2pi(this.theta)) ** 2)
    } else {
      return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2)
    }
  }

  stepToward(target, step_size) {
    // implementation of stanley controller
    // source: https://dingyan89.medium.com/three-methods-of-vehicle-lateral-control-pure-pursuit-stanley-and-mpc-db8cc1d32081
    const k = 0.3    // cross track error gain
    const ks = 0.1 // softning constant
    let e = crossTrackError(this.x, this.y, target.x, target.y, target.theta)
    let delta = (target.theta - this.theta) + Math.atan((k * e) / (ks + step_size))
    console.log("e: " + e)
    // console.log("delta1: " + delta)
    delta = angleClamp(delta, this.config.min_delta, this.config.max_delta)
    // console.log("delta2: " + delta)
    // delta = mod2pi(delta)

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
