class RandomTSPSolver {
  constructor(graph) {
    this.graph = graph
  }


  solve() {
    let res = randomPathFromNode(pickNRandomElements(this.graph.nodes, 1)[0])

    if (res[res.length - 1].neighbors_id_set.has(res[0].id)) {
      res.push(res[0])
    }
    return res
  }
}
