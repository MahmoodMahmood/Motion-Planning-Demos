let distance_cache = {}

// Get a key that indexes into the distance cache
function nodesToKey(node1, node2) {
  if (node1.x < node2.x) {
    return node1.x + "_" + node2.x + "_" + node1.y + "_" + node2.y
  } else {
    return node2.x + "_" + node1.x + "_" + node2.y + "_" + node1.y
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

function totalWalkDist(nodes) {
  let dist = 0
  for (let i = 0; i < nodes.length-1; i++) {
    dist+=calcDist(nodes[i], nodes[i+1])
  }
  return dist
}

let dijkstra_cache = {}
function dijkstra(node1, node2) {
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

  const key = nodesToKey(node1, node2)
  if (key in dijkstra_cache) return dijkstra_cache[key]

  const node1_node_dist = new NodeDistObj(node1, 0, null)
  let pq = new Heap([node1_node_dist], nodeDistComparator)
  let visited_dict = {}
  visited_dict[node1.id] = node1_node_dist

  while (!pq.empty()) {
    const cur_node_dist_obj = pq.pop()
    if (cur_node_dist_obj.node.id == node2.id) {
      // found target node
      const res = cur_node_dist_obj.getPath()
      dijkstra_cache[key] = res
      return res
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
  dijkstra_cache[key] = []
  return []
}