class SimulatedAnnealingTwoOptSolver {
    constructor(graph) {
      this.solver = new SimulatedAnnealingSolver(graph, randomPathFromRandomNode, twoOptRandomNodes)
      this.meta = this.solver.meta
    }
  
    solve() {
      this.meta = this.solver.meta
      return this.solver.solve()
    }
  }
  