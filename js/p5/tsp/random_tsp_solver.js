class RandomTSPSolver {
  constructor(graph, post_process_func=(x => x)) {
    this.graph = graph
    this.post_process_func = post_process_func
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

    res = this.post_process_func(res)
    this.updateMetaString()
    return res
  }
}
