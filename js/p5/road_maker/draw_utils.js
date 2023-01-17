function drawPath(path) {
  for (node of path) {
    strokeWeight(0)
    fill(0)
    circle(node.x, node.y, 40)
  }

  if (path.length < 2) { return }
  noFill()
  stroke(0)
  strokeWeight(40)
  beginShape()
  curveVertex(path.head.x, path.head.y)
  for (node of path) {
    curveVertex(node.x, node.y)
  }
  curveVertex(path.tail.x, path.tail.y)
  endShape()

}