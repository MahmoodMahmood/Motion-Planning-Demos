class SimulatedAnnealingSolverWithNN {
    constructor(graph) {
        this.solver = new SimulatedAnnealingSolver(graph, bestGreedyPathFromAnyNode, 0.999)
        this.meta = this.solver.meta
    }

    solve() {
        this.meta = this.solver.meta
        return this.solver.solve()
    }
}