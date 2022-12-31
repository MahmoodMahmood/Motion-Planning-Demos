class SimulatedAnnealingSolver {
    constructor(graph) {
        this.graph = graph
        this.solution = randomPathFromNode()
        this.epsilon = 1.0
    }

    swapNodes() {
      [idx1, idx2] = pickNRandomElements(this.graph.nodes, 2)

    }

    solve() {

    }
}