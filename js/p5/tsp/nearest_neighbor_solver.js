class NearestNeighborSolver {
  constructor(graph) {
    this.graph = graph
    this.meta = ""
    this.current_first_node_idx = 0
  }

  updateMetaString() {
    this.meta = "Best path starts from node #" + (this.current_first_node_idx-1)
  }

  greedyPathFromNode(node) {
    let visited = new Set([node.id])
    let res = [node]
    while (res.length < this.graph.nodes.length) {
      const nn = nearestNeighbor(res[res.length - 1], visited)
      if (nn.id == -1) {
        return res
      }
      visited.add(nn.id)
      res.push(nn)
    }
    return res
  }

  solve() {
    let res = this.greedyPathFromNode(this.graph.nodes[this.current_first_node_idx])

    this.current_first_node_idx = (this.current_first_node_idx + 1) % (this.graph.nodes.length - 1)

    if (res[res.length - 1].neighbors_id_set.has(res[0].id)) {
      res.push(res[0])
    }

    this.updateMetaString()
    return res
  }
}
