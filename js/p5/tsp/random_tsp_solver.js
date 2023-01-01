class RandomTSPSolver {
  constructor(graph) {
    this.graph = graph
    this.num_iters = 0
    this.meta = ""
  }

  updateMetaString() {
    this.num_iters++
    this.meta = "Num attempted solutions: " + this.num_iters.toFixed(0)
  }

  solve() {
    let res = randomPathFromNode(pickNRandomElements(this.graph.nodes, 1)[0])

    if (res[res.length - 1].neighbors_id_set.has(res[0].id)) {
      res.push(res[0])
    }

    this.updateMetaString()
    return res
  }
}
