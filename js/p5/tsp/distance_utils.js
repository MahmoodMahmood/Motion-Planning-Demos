let distance_cache = {}

// Get a key that indexes into the distance cache
function nodesToKey(node1, node2) {
  if (node1.x < node2.x) {
    return node1.x + "" + node2.x + "" + node1.y + "" + node2.y
  } else {
    return node2.x + "" + node1.x + "" + node2.y + "" + node1.y
  }
}

// Returns L2 distance between
function calcDist(node1, node2) {
  const key = nodesToKey(node1, node2)
  if (key in distance_cache) {
    return distance_cache[key]
  }
  const dist = Math.sqrt((node1.x-node2.x)**2 + (node1.y-node2.y)**2)
  distance_cache[key] = dist
  return dist
}

function nodeSqDist(node, x, y) {
  return (node.x-x)**2 + (node.y-y)**2
}

function nodeDist(node, x, y) {
  return sqrt(nodeSqDist(node, x, y))
}