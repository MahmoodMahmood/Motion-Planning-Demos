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

function randomPathFromRandomNode(graph) {
  return randomPathFromNode(pickNRandomElements(graph.nodes, 1)[0])
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

function greedyPathFromNode(graph, node) {
  let visited = new Set([node.id])
  let res = [node]
  while (res.length < graph.nodes.length) {
    const nn = nearestNeighbor(res[res.length - 1], visited)
    if (nn.id == -1) {
      return res
    }
    visited.add(nn.id)
    res.push(nn)
  }

  if (res[res.length - 1].neighbors_id_set.has(node.id)) {
    res.push(node)
  }

  return res
}

function bestGreedyPathFromAnyNode(graph) {
  return graph.nodes.reduce(([best_path, best_dist], node) => {
    const path = greedyPathFromNode(graph, node)
    const dist = totalWalkDist(path)
    if (path.length == graph.nodes.length + 1 && dist < best_dist) {
      return [path, dist]
    }
    return [best_path, best_dist]
  }, [[], Infinity])[0]
}

function prev_idx(path, idx) {
  if (idx == 0) return path.length - 1
  return idx - 1
}

function next_idx(path, idx) {
  if (idx == path.length - 1) return 0
  return idx + 1
}

function is_replaceable(path, idx_to_remove, idx_to_add) {
  const prev = path[prev_idx(path, idx_to_remove)]
  const next = path[next_idx(path, idx_to_remove)]
  const new_node = path[idx_to_add]
  return prev.neighbors_id_set.has(new_node.id) && next.neighbors_id_set.has(new_node.id)
}

function nodes_are_swappable(path, idx1, idx2) {
  return is_replaceable(path, idx1, idx2) && is_replaceable(path, idx2, idx1)
}

function swapRandomNodes(path) {
  const [idx1, idx2] = generateNRandomNums(2, path.length)
  if (!nodes_are_swappable(path, idx1, idx2)) return path
  const temp = path[idx2]
  path[idx2] = path[idx1]
  path[idx1] = temp
  return path
}

function twoOpt(path, idx1, idx2) {
  if (idx1 > idx2) {
    const temp = idx1
    idx1 = idx2
    idx2 = temp
  }
  if (idx1 <= 0 || idx2 <= 0 || idx1 >= path.length-1 || idx2 >= path.length-1) {
    // I'm too lazy to deal with these confusing edge cases
    return path
  }

  const node1 = path[idx1]
  const node2 = path[idx2]
  const next1 = path[idx1+1]
  const next2 = path[idx2+1]
  if (node1.neighbors_id_set.has(node2.id) && next1.neighbors_id_set.has(next2.id)) {
    return path.slice(0, idx1+1).concat(path.slice(idx1+1, idx2+1).reverse()).concat(path.slice(idx2+1))
  }
  return path
}

function twoOptRandomNodes(path) {
  const [idx1, idx2] = generateNRandomNums(2, path.length)
  return twoOpt(path, idx1, idx2)
}

function twoOptPath(path) {
  let best_dist = totalWalkDist(path)
  for (let i = 1; i < path.length-1; i++) {
    for (let j = i+1; j < path.length-1; j++) {
      const test = twoOpt(path, i, j)
      const dist = totalWalkDist(test)
      if (dist < best_dist) {
        best_dist = dist
        path = test
      }
    }
  }
  return path
}

function fullTwoOptPath(path) {
  let old_dist = Infinity
  let new_dist = totalWalkDist(path)
  while (new_dist < old_dist) {
    path = twoOptPath(path)
    old_dist = new_dist
    new_dist = totalWalkDist(path)
  }
  return path
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
      for (let j = i + 1; j < num_nodes; j++) {
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