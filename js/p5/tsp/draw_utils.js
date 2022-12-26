function drawEdge(node1, node2, stroke_weight=1) {
  strokeWeight(stroke_weight)
  line(node1.x, node1.y, node2.x, node2.y)

  const angle = Math.atan2(node2.y-node1.y, node2.x-node1.x)
  
  // Prevents double drawing of distance text, only keep the right side up text
  if (!draw_text || angle > Math.PI/2 || angle < -Math.PI/2) return
  const dist = calcDist(node1, node2)
  const midx = (node1.x + node2.x)/2
  const midy = (node1.y + node2.y)/2
  fill('black')
  textSize(canvas_width/40)
  
  push()
  translate()
  translate(midx, midy)
  rotate(angle)
  text(dist.toPrecision(4), 0, 0)
  pop()
}

function drawNode(node) {
  strokeWeight(node.draw_config.stroke)
  stroke('black')
  fill(node.draw_config.color)
  circle(node.x, node.y, node.draw_config.radius)
  node.neighbors.forEach(neighbor => drawEdge(node, neighbor))
}

function drawHighlightedPath(path) {
  if (path.length == 0) {
    return
  }

  // bold the current selected edge
  for (let i = 0; i < path.length - 1; i++) {
    drawEdge(path[i], path[i+1], 4)
  }
}