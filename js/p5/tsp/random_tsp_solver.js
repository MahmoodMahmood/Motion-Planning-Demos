class RandomTSPSolver {
  constructor(graph) {
    this.graph = graph
  }

  solve() {
    return pickNRandomElements(this.graph.nodes, this.graph.nodes.length)
  }
}
