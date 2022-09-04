function mod2pi(a) {
  while (a > 2 * Math.PI || a < 0) {
    a += a < 0 ? 2 * Math.PI : -2 * Math.PI
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

  // sign of distance, yes I know there is probably a better way of doing this
  let sgn = (x_start - 0) * (y_dest - b) - (y_start - b) * (x_dest - 0)
  // distance between point and line with eqn: y = mx + b
  // source: https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
  return Math.abs(b + m * x_start - y_start) / Math.sqrt(1 + m ** 2) * (sgn > 0 ? 1 : -1)
}

function angleDist(a1, a2) {
  let phi = Math.abs(a2 - a1) % (2 * Math.PI);
  return mod2pi(phi);
}

class CarNode extends AbstractTreeNode {
  constructor(state, config, parent) {
    super(parent)
    this.x = state.x
    this.y = state.y
    this.theta = state.theta
    this.config = config
  }

  // standard distance function
  dist(other) {
    if (other instanceof CarNode) {
      return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2 + 3.0 * angleDist(other.theta, this.theta) ** 2)
    } else {
      return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2)
    }
  }

  // special distance function for selecting a node
  distNodeSelect(other) {
    if (other instanceof CarNode) {
      return this.getStepDelta(other, 10)
    } else {
      return this.dist(other)
    }
  }

  getStepDelta(target, step_size) {
    // implementation of stanley controller
    // source: https://dingyan89.medium.com/three-methods-of-vehicle-lateral-control-pure-pursuit-stanley-and-mpc-db8cc1d32081
    const k = global_config.cross_track_error_gain    // cross track error gain
    const ks = 0.1 // softning constant
    let e = crossTrackError(this.x, this.y, target.x, target.y, target.theta)
    let delta = mod2pi(target.theta - this.theta) + Math.atan((k * e) / (ks + step_size))
    delta = angleClamp(delta, this.config.min_delta, this.config.max_delta)
    return delta
  }

  stepToward(target, step_size) {
    let delta = this.getStepDelta(target, step_size)
    this.x += (step_size * Math.cos(this.theta))
    this.y += (step_size * Math.sin(this.theta))
    this.theta += (step_size * Math.tan(delta) / this.config.L)
    this.theta = mod2pi(this.theta)
  }

  inCollision(obstacles) {
    // front right, front left, back right, back left corners in that order
    let vertices = [{
      x: this.x + this.config.L * Math.cos(this.theta) - this.config.W / 2 * sin(this.theta),
      y: this.y + this.config.L * Math.sin(this.theta) + this.config.W / 2 * cos(this.theta)
    },

    {
      x: this.x + this.config.L * Math.cos(this.theta) + this.config.W / 2 * sin(this.theta),
      y: this.y + this.config.L * Math.sin(this.theta) - this.config.W / 2 * cos(this.theta)
    },

    {
      x: this.x - this.config.W / 2 * sin(this.theta),
      y: this.y + this.config.W / 2 * cos(this.theta)
    },

    {
      x: this.x + this.config.W / 2 * sin(this.theta),
      y: this.y - this.config.W / 2 * cos(this.theta)
    }]

    return vertices.some(v => obstacles.some(o => o.inObstacle(v.x, v.y)));
  }

  copy() {
    return new CarNode({ x: this.x, y: this.y, theta: this.theta }, { ...this.config }, this.parent)
  }

  draw() {
    push()
    strokeWeight(1)
    stroke('black')
    fill(this.config.color)
    rectMode(CORNER)
    translate(this.x, this.y)
    rotate(this.theta + Math.PI / 2)
    // our car has x and y at rear axle, rectMode(CORNER) assumes x and y are top left coordinates,
    // also theta is the angle from the horizon
    rect(-this.config.W / 2, -this.config.L * 0.9, this.config.W, this.config.L)
    fill('black')
    circle(0, 0, 5)
    pop()
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
