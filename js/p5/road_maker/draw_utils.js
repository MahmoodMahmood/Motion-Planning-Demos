const roadWidth = 60

function drawPath(path) {
  for (node of path) {
    strokeWeight(0)
    fill(0)
    circle(node.x, node.y, path.radius * 2)
  }

  if (path.length < 2) { return }
  noFill()
  stroke("black")
  strokeWeight(path.radius * 2)
  beginShape()
  for (node of path) {
    vertex(node.x, node.y)
  }
  endShape()

  setLineDash([10, 30])
  noFill()
  stroke("white")
  strokeWeight(1)
  beginShape()
  for (node of path) {
    vertex(node.x, node.y)
  }
  endShape()
  setLineDash([])
}

function setLineDash(list) {
  drawingContext.setLineDash(list);
}