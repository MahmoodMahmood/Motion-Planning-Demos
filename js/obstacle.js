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