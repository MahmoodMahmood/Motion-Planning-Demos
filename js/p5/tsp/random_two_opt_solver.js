class RandomTwoOptSolver {
  constructor(graph) {
    this.solver = new RandomTSPSolver(graph, fullTwoOptPath)
    this.meta = this.solver.meta
  }

  solve() {
    this.meta = this.solver.meta
    return this.solver.solve()
  }
}
