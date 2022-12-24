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
    if (!result.includes(num)) {
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

function isGraphFullyConnected(graph) {
  let visited_nodes = new Set()
  let cur_nodes = [graph.nodes[0]]
  while (cur_nodes.length > 0) {
    let node = cur_nodes.pop()
    for (neighbor of node.neighbors) {
      if (!visited_nodes.has(neighbor.id) && !cur_nodes.includes(neighbor)) {
        cur_nodes.push(neighbor)
      }
    }
    visited_nodes.add(node.id)
  }
  return graph.nodes.length == visited_nodes.size
}

function shortestPathDijkstra(node1, node2) {
  class NodeDistObj {
    constructor(node, dist, pred) {
      this.node = node
      this.dist = dist
      this.pred = pred
    }

    getPath() {
      let res = []
      let cur = this
      while (cur) {
        res.push(cur.node)
        cur = cur.pred
      }
      return res.reverse()
    }
  }

  function nodeDistComparator(lhs, rhs) {
    return lhs.dist < rhs.dist
  }

  const node1_node_dist = new NodeDistObj(node1, 0, null)
  let pq = new Heap([node1_node_dist], nodeDistComparator)
  let visited_dict = {}
  visited_dict[node1.id] = node1_node_dist

  while (!pq.empty()) {
    const cur_node_dist_obj = pq.pop()
    // console.log(cur_node_dist_obj)
    if (cur_node_dist_obj.node.id == node2.id) {
      // found target node
      return cur_node_dist_obj.getPath()
    }
    for (const neighbor of cur_node_dist_obj.node.neighbors) {
      const cur_dist = cur_node_dist_obj.dist + calcDist(cur_node_dist_obj.node, neighbor)
      if (!(neighbor.id in visited_dict)) {
        // First time seeing this neighbor
        const new_dist_obj = new NodeDistObj(neighbor, cur_dist, cur_node_dist_obj)
        pq.push(new_dist_obj)
        visited_dict[neighbor.id] = new_dist_obj
      } else {
        // Seen this neighbor before, check if we need to update the shortest path to it
        if (visited_dict[neighbor.id].dist > cur_dist) {
          // New path is shorter need to update existing entry in pq
          pq.edit(visited_dict[neighbor.id], dist_obj => {dist_obj.dist = cur_dist})
        }
      }
    }
  }
  return None
}

// https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function intersects(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}

//
// Classes
//
class UndirectedGraphNode {
  constructor(id, neighbors) {
    this.id = id
    this.x = Math.random() * canvas_width
    this.y = Math.random() * canvas_height
    this.neighbors = new Set()
    if (neighbors.length > 0) {
      neighbors.forEach(node => this.addNeighbor(node))
    }
  }

  // Only need to call this on one of the nodes
  addNeighbor(node) {
    this.neighbors.add(node)
    node.neighbors.add(this)
  }
}

class UndirectedGraph {
  constructor(num_node) {
    this.attempted_number_of_edges = 20;
    this.nodes = []
    for (let i = 0; i < num_node; i++) {
      this.nodes.push(new UndirectedGraphNode(i, []))
    }

    this.nodes.forEach(node => {
      const num_neighbors = Math.max(1, Math.ceil(Math.random() * this.attempted_number_of_edges))
      pickNRandomElements(this.nodes, num_neighbors).forEach(other_node => {
        if (node.id != other_node.id && !this.intersectsAnyEdge(node.x, node.y, other_node.x, other_node.y)) {
          node.addNeighbor(other_node)
        } 
      })
    })
  }

  draw() {
    this.nodes.forEach(node => drawNode(node, point_config))
  }

  // Very inefficient, can be way optimized
  intersectsAnyEdge(x1, y1, x2, y2) {
    for (const node of this.nodes) {
      for (const neighbor of node.neighbors) {
        if (intersects(x1, y1, x2, y2, node.x, node.y, neighbor.x, neighbor.y)) return true
      }
    }
    return false
  }
}