class SimulatedAnnealingSolver {
  constructor(graph, initializer = randomPathFromRandomNode, randomIter = swapRandomNodes, gamma = 0.99995   ) {
    this.graph = graph
    this.solution = initializer(this.graph)
    this.best_dist = totalWalkDist(this.solution)
    this.temprature = 1.0
    this.meta = ""
    this.gamma = gamma
  }

  coolDownTemprature() {
    this.temprature = this.temprature * this.gamma
  }

  updateMetaString() {
    this.meta = "Current temprature: " + this.temprature.toFixed(3)
  }

  solve() {
    let new_solution = structuredClone(this.solution)
    if (new_solution[0].id == new_solution[new_solution.length - 1].id) new_solution.pop()
    new_solution = randomIter(new_solution)
    if (new_solution[0].id != new_solution[new_solution.length - 1].id) new_solution.push(new_solution[0])

    const new_dist = totalWalkDist(new_solution)
    // 500 is the width of the canvas
    const cost = (new_dist - this.best_dist) / 500
    if (cost < 0 || Math.random() < Math.exp(-cost / this.temprature)) {
      this.best_dist = new_dist
      this.solution = new_solution
    }

    this.updateMetaString()
    this.coolDownTemprature()
    return this.solution
  }
}