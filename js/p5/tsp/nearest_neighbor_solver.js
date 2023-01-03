class NearestNeighborSolver {
  constructor(graph) {
    this.graph = graph
    this.meta = ""
    this.current_first_node_idx = 0
    this.best_path_idx = 0
    this.best_path_dist = Infinity
  }

  updateMetaString() {
    this.meta = "Best path starts from node #" + this.best_path_idx
  }

  solve() {
    let res = greedyPathFromNode(this.graph, this.graph.nodes[this.current_first_node_idx])
    const dist = totalWalkDist(res)

    if (dist < this.best_path_dist) {
      this.best_path_dist = dist
      this.best_path_idx = this.current_first_node_idx
    }

    this.current_first_node_idx = (this.current_first_node_idx + 1) % (this.graph.nodes.length - 1)

    this.updateMetaString()
    return res
  }
}
