class SimulatedAnnealingSolver {
  constructor(graph) {
    this.graph = graph
    this.solution = randomPathFromNode(pickNRandomElements(this.graph.nodes, 1)[0])
    this.best_dist = totalWalkDist(this.solution)
    this.temprature = 1.0
    this.meta = ""
  }

  swapRandomNodes(path) {
    const [idx1, idx2] = generateNRandomNums(2, path.length)
    const temp = path[idx2]
    path[idx2] = path[idx1]
    path[idx1] = temp
    fixBrokenPath(path)
  }

  prev_idx(path, idx) {
    if (idx == 0) return path.length-1
    return idx - 1
  }

  next_idx(path, idx) {
    if (idx == path.length-1) return 0
    return idx+1
  }

  is_replaceable(path, idx_to_remove, idx_to_add) {
    const prev = path[this.prev_idx(path, idx_to_remove)]
    const next = path[this.next_idx(path, idx_to_remove)]
    const new_node = path[idx_to_add]
    return prev.neighbors_id_set.has(new_node.id) && next.neighbors_id_set.has(new_node.id)
  }

  nodes_are_swappable(path, idx1, idx2) {
    return this.is_replaceable(path, idx1, idx2) && this.is_replaceable(path, idx2, idx1)
  }

  swapRandomNodesV2(path) {
    const [idx1, idx2] = generateNRandomNums(2, path.length)
    if (!this.nodes_are_swappable(path, idx1, idx2)) return
    const temp = path[idx2]
    path[idx2] = path[idx1]
    path[idx1] = temp
  }

  coolDownTemprature() {
    this.temprature = this.temprature * 0.99995
  }

  updateMetaString() {
    this.meta = "Current temprature: " + this.temprature.toFixed(3)
  }

  solve() {
    let new_solution = structuredClone(this.solution)
    if (new_solution[0].id == new_solution[new_solution.length - 1].id) new_solution.pop()
    this.swapRandomNodesV2(new_solution)
    if (new_solution[0].id != new_solution[new_solution.length - 1].id) new_solution.push(new_solution[0])

    const new_dist = totalWalkDist(new_solution)
    // 500 is the width of the canvas
    const cost = (new_dist - this.best_dist) / 500
    if (cost < 0 || Math.random() < Math.exp(-cost / this.temprature)) {
      this.best_dist = new_dist
      this.solution = new_solution
    }

    this.updateMetaString()
    this.coolDownTemprature()
    return this.solution
  }
}