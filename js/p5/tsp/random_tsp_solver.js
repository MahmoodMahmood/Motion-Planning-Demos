class RandomTSPSolver {
  constructor(graph) {
    this.graph = graph
    this.best_dist = Infinity
    this.best_solve = undefined
  }

  solve() {
    let solve = pickNRandomElements(this.graph.nodes, this.graph.nodes.length)
    solve.push(solve[0])

    const dist = totalWalkDist(solve)

    if (dist < this.best_dist) {
      this.best_solve = solve
      this.best_dist = dist
      return solve
    }

    return this.best_solve
  }
}
