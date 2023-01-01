class SimulatedAnnealingSolver {
  constructor(graph) {
    this.graph = graph
    this.solution = randomPathFromNode(pickNRandomElements(this.graph.nodes, 1)[0])
    this.best_dist = totalWalkDist(this.solution)
    this.temprature = 1.0
  }

  trimPathFwd(path) {
    const nodes_set = new Set(this.graph.nodes.map(x => x.id))
    for (let i = 0; i < path.length; i++) {
      if (nodes_set.has(path[i].id)) {
        nodes_set.delete(path[i].id)
      }

      if (nodes_set.size == 0 && path[0].neighbors_id_set.has(path[i].id)) {
        return path.slice(0, i+1)
      }
    }
    return path
  }

  trimPathRev(path) {
    const nodes_set = new Set(this.graph.nodes.map(x => x.id))
    for (let i = path.length-1; i >= 0; i--) {
      if (nodes_set.has(path[i].id)) {
        nodes_set.delete(path[i].id)
      }

      if (nodes_set.size == 0 && path[path.length-1].neighbors_id_set.has(path[i].id)) {
        return path.slice(i, path.length)
      }
    }
    return path
  }

  swapRandomNodes(path) {
    const [idx1, idx2] = generateNRandomNums(2, path.length)
    const temp = path[idx2]
    path[idx2] = path[idx1]
    path[idx1] = temp
    fixBrokenPath(path)
  }

  coolDownTemprature() {
    this.temprature = this.temprature * 0.999
  }

  solve() {
    let new_solution = structuredClone(this.solution)
    this.swapRandomNodes(new_solution)
    new_solution = this.trimPathFwd(new_solution)
    new_solution = this.trimPathRev(new_solution)
    new_solution.push(new_solution[0])

    const new_dist = totalWalkDist(new_solution)
    // 500 is the width of the canvas
    const cost = (new_dist - this.best_dist) / 500
    if (cost < 0 || Math.random() < Math.exp(-cost / this.temprature)) {
      this.best_dist = new_dist
      this.solution = new_solution
    }

    this.coolDownTemprature()
    return this.solution
  }
}