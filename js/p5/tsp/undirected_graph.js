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
  let prev_neighbors_id_set = null
  let i = 0
  for (const node of path) {
    i++
    if (prev_neighbors_id_set && !prev_neighbors_id_set.has(node.id)) {
      return false
    }
    prev_neighbors_id_set = node.neighbors_id_set
  }
  return true
}

function randomPathFromNode(node) {
  function dfs(res, visited) {
    const last = res[res.length - 1]
    for (let neighbor of pickNRandomElements(last.neighbors, last.neighbors.length)) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id)
        res.push(neighbor)
        dfs(res, visited)
      }
    }
  }

  let result = [node]
  dfs(result, new Set([node.id]))
  return result
}

function fixBrokenPath(path) {
  for (let i = path.length - 2; i >= 0; i--) {
    if (path[i + 1].id == path[i].id) {
      path.splice(i + 1, 1)
      continue
    }
    if (path[i + 1].neighbors_id_set.has(path[i].id)) {
      continue
    }
    const d = dijkstra(path[i + 1], path[i])
    // insert the path from path[i+1] to path[i] between i and i+1, but don't include the
    // first and last elements of that path becasue they are i and i+1
    path.splice(i + 1, 0, ...d.slice(1, d.length - 1))
  }
}

function pathHasAllGraphNodes(graph, path) {
  const path_set = new Set(path.map(x => x.id))
  const intersection = graph.nodes.filter(x => path_set.has(x.id))
  return intersection.length == path_set.size
}

function nearestNeighbor(node, exluded_ids = new Set()) {
  return node.neighbors.reduce((closest, curr) =>
    (!exluded_ids.has(curr.id) && (calcDist(node, curr) < calcDist(node, closest))) ? curr : closest,
    new UndirectedGraphNode(-1, [], Infinity, Infinity)
  )
}

//
// Classes
//
class UndirectedGraphNode {
  constructor(id, neighbors, x, y) {
    this.id = id
    this.x = x != undefined ? x : Math.random() * canvas_width
    this.y = y != undefined ? y : Math.random() * canvas_height
    this.neighbors = []
    this.neighbors_id_set = new Set() // used as an optimization
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
    if (node.id == this.id || this.neighbors_id_set.has(node.id)) {
      return
    }
    this.neighbors.push(node)
    this.neighbors_id_set.add(node.id)
    node.neighbors.push(this)
    node.neighbors_id_set.add(this.id)
  }
}

class UndirectedGraph {
  constructor(num_nodes, attempted_num_edges, allow_intersections) {
    this.nodes = []
    for (let i = 0; i < num_nodes; i++) {
      this.nodes.push(new UndirectedGraphNode(i, []))
    }
    
    const fully_connected = allow_intersections && (attempted_num_edges >= num_nodes);
    if (fully_connected) {
      this.fullyConnectGraph()
    } else {
      this.addRandomNEdges(attempted_num_edges, allow_intersections)
    }

  }

  fullyConnectGraph() {
    const num_nodes = this.nodes.length
    for (let i = 0; i < num_nodes; i++) {
      for (let j = i+1; j < num_nodes; j++) {
        this.nodes[i].addNeighbor(this.nodes[j])
      }
    }
  }
  
  addRandomNEdges(attempted_num_edges, allow_intersections) {
    const num_nodes = this.nodes.length
    for (let i = 0; i < attempted_num_edges; i++) {
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