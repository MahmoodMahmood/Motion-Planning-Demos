class Obstacle {
  constructor(x1, y1, x2, y2) {
    const minL = 20
    this.x1 = x1
    this.y1 = y1
    // make sure width and height are at least minL units
    this.x2 = abs(x2 - x1) > minL ? x2 : x1 + (x2 - x1 > 0 ? 1 : -1) * minL
    this.y2 = abs(y2 - y1) > minL ? y2 : y1 + (y2 - y1 > 0 ? 1 : -1) * minL

    // ensure x1 < x2 and y1 < y2
    if (this.x1 > this.x2) [this.x1, this.x2] = [this.x2, this.x1]
    if (this.y1 > this.y2) [this.y1, this.y2] = [this.y2, this.y1]
    this.color = 'black'
  }

  inObstacle(x, y) {
    return ((x > this.x1 && x < this.x2) || (x > this.x2 && x < this.x1)) &&
      ((y > this.y1 && y < this.y2) || (y > this.y2 && y < this.y1))
  }

  l1Dist(x, y) {
    if (this.inObstacle(x, y)) return 0
    return min(min(abs(x - this.x1), abs(x - this.x2)) + min(abs(y - this.y1), abs(y - this.y2)))
  }

  distSquared(x, y) {
    let center_x = (this.x1 + this.x2) / 2
    let center_y = (this.y1 + this.y2) / 2
    let w = this.x2 - this.x1
    let h = this.y2 - this.y1
    let dx = max(abs(x - center_x) - w / 2, 0);
    let dy = max(abs(y - center_y) - h / 2, 0);
    return dx * dx + dy * dy;
  }

  dist(x, y) {
    return Math.sqrt(this.distSquared(x, y))
  }

  // Returns the nearest point on the obstacle
  // NOTE: assumes that the point is OUTSIDE the obstacle
  getNearestPt(x, y) {
    let res_x = x > this.x2 ? this.x2 : x
    res_x = res_x < this.x1 ? this.x1 : res_x

    let res_y = y > this.y2 ? this.y2 : y
    res_y = res_y < this.y1 ? this.y1 : res_y

    return [res_x, res_y]
  }

  draw() {
    strokeWeight(1)
    stroke('black')
    rectMode(CORNERS)
    fill(this.color)
    rect(this.x1, this.y1, this.x2, this.y2)
  }
}