//
// Configs
//
const point_config = {
  color: 'blue',
  radius: 10
}

//
// Math utils
//
let distance_cache = {}

// Get a key that indexes into the distance cache
function nodesToKey(node1, node2) {
  if (node1.id < node2.id) {
    return node1.id + "" + node2.id
  } else {
    return node2.id + "" + node1.id
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

//
// Draw utils
//
function drawEdge(node1, node2) {
  line(node1.x, node1.y, node2.x, node2.y)

  const angle = Math.atan2(node2.y-node1.y, node2.x-node1.x)
  
  // Prevents double drawing of distance text, only keep the right side up text
  if (angle > Math.PI/2 || angle < -Math.PI/2) return
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

function drawNode(node, config) {
  strokeWeight(1)
  stroke('black')
  fill(config.color)
  circle(node.x, node.y, config.radius)
  node.neighbors.forEach(neighbor => drawEdge(node, neighbor))
}

//
// Other Utils
//
function generateNRandomNums(N, max) {
  let result = []
  while (result.length < Math.min(N, max)) {
    const num = Math.floor(Math.random() * max)
    if (!(num in result)) {
      result.push(num)
    }
  }
  return result
}

function pickNRandomElements(arr, N) {
  if (arr.length == 0) return []
  if (arr.length == 1) return Math.min(1,N)
  const indices_to_pick = generateNRandomNums(N, arr.length)
  return indices_to_pick.map(index => arr[index])
}

//
// Classes
//
class UndirectedGraphNode {
  constructor(id, neighbors) {
    this.id = id
    this.x = Math.random() * canvas_width
    this.y = Math.random() * canvas_height
    this.neighbors = []
    if (neighbors.length > 0) {
      neighbors.forEach(node => this.addNeighbor(node))
    }
  }

  // Only need to call this on one of the nodes
  addNeighbor(node) {
    if (node.id == this.id) return;
    // Gross implementation, bleh
    if (!(node in this.neighbors)) {
      this.neighbors.push(node)
    }
    
    if (!(this in node.neighbors)) {
      node.neighbors.push(this)
    }
  }
}

class UndirectedGraph {
  constructor(num_node, avg_edges_per_node) {
    this.nodes = []
    for (let i = 0; i < num_node; i++) {
      this.nodes.push(new UndirectedGraphNode(i, []))
    }

    this.nodes.forEach(node => {
      const num_neighbors = Math.max(1, Math.ceil(Math.random() * avg_edges_per_node))
      pickNRandomElements(this.nodes, num_neighbors).forEach(other_node => node.addNeighbor(other_node))
    })
  }

  draw() {
    this.nodes.forEach(node => drawNode(node, point_config))
  }
}