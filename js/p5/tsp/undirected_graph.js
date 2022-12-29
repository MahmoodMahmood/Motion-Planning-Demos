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
          pq.edit(visited_dict[neighbor.id], dist_obj => {
            dist_obj.dist = cur_dist
            dist_obj.pred = cur_node_dist_obj
          })
        }
      }
    }
  }
  return []
}

// https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function intersects(a, b, c, d, p, q, r, s) {
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

function isValidPath(path) {
  if (path.length < 2) return false
  let prev_neighbors = null
  for (const node of path) {
    if (prev_neighbors && !prev_neighbors.has(node)) return false
    prev_neighbors = node.neighbors
  }
  return true
}

//
// Classes
//
class UndirectedGraphNode {
  constructor(id, neighbors, x, y) {
    this.id = id
    this.x = x != undefined ? x : Math.random() * canvas_width
    this.y = y != undefined ? y : Math.random() * canvas_height
    this.neighbors = new Set()
    this.draw_config = {
      color: 'blue',
      radius: 10,
      stroke: 1
    }
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
  constructor(num_node, allow_intersections) {
    const attempted_number_of_edges = 1000 * num_node;
    this.nodes = []
    for (let i = 0; i < num_node; i++) {
      this.nodes.push(new UndirectedGraphNode(i, []))
    }

    for (let i = 0; i < attempted_number_of_edges; i++) {
      const [node1, node2] = pickNRandomElements(this.nodes, 2)
      if (allow_intersections || !this.intersectsAnyEdge(node1.x, node1.y, node2.x, node2.y)) {
        node1.addNeighbor(node2)
      }
    }
  }

  draw() {
    drawNodes(this.nodes)
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

  // Could be optimized with quadtrees later
  getNearestNode(x, y) {
    return this.nodes.reduce((a, b) => nodeSqDist(a, x, y) < nodeSqDist(b, x, y) ? a : b)
  }
}