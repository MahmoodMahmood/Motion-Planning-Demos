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

function randomPathFromNode(node) {
  function dfs(res, visited = new Set(res)) {
    const last = res[res.length - 1]
    for (let neighbor of pickNRandomElements(Array.from(last.neighbors), last.neighbors.size)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        res.push(neighbor)
        dfs(res, visited)
      }
    }
  }

  let result = [node]
  dfs(result)
  return result
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
  constructor(num_nodes, num_edges, allow_intersections) {
    const attempted_number_of_edges = num_edges;
    this.nodes = []
    for (let i = 0; i < num_nodes; i++) {
      this.nodes.push(new UndirectedGraphNode(i, []))
    }

    for (let i = 0; i < attempted_number_of_edges; i++) {
      for (let j = 0; j < num_nodes; j++) {
        const node1 = this.nodes[j]
        const node2 = pickNRandomElements(this.nodes, 1)[0]
        if (allow_intersections || !this.intersectsAnyEdge(node1.x, node1.y, node2.x, node2.y)) {
          node1.addNeighbor(node2)
        }
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