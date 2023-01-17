const roadWidth = 60

function drawPath(path) {
  for (node of path) {
    strokeWeight(0)
    fill(0)
    circle(node.x, node.y, path.radius * 2)
  }

  if (path.length < 2) { return }
  noFill()
  stroke(0)
  strokeWeight(path.radius * 2)
  beginShape()
  for (node of path) {
    vertex(node.x, node.y)
  }
  endShape()
}


function drawCar(car) {
  if (car == null) { return }
  push()
  strokeWeight(1)
  stroke('grey')
  fill(car.config.color)
  rectMode(CORNER)
  translate(car.x, car.y)
  rotate(car.theta + Math.PI / 2)
  // our car has x and y at rear axle, rectMode(CORNER) assumes x and y are top left coordinates,
  // also theta is the angle from the horizon
  rect(-car.config.W / 2, -car.config.L * 0.9, car.config.W, car.config.L)
  fill('grey')
  circle(0, 0, 2)
  pop()
}