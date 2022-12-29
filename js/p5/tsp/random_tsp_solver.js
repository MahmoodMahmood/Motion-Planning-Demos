class RandomTSPSolver {
  constructor(graph) {
    this.graph = graph
  }

  solve() {
    let res = pickNRandomElements(this.graph.nodes, 1)
    let visited = new Set(res)

    function dfs() {
      const last = res[res.length-1]
      for (let neighbor of pickNRandomElements(Array.from(last.neighbors), last.neighbors.size)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          res.push(neighbor)
          dfs()
        }
      }
    }

    dfs()
    res.push(res[0])
    return res
  }
}
