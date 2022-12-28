if( 'function' === typeof importScripts) {
  importScripts("distance_utils.js",
                "random_utils.js",
                "undirected_graph.js",
                "random_tsp_solver.js")
}

onmessage = (e) => {
  const solver_class = e.data.solver_class
  const graph = e.data.graph
  let solver
  if (solver_class == "random") {
    solver = new RandomTSPSolver(graph)
  }

  let best_dist = Infinity
  while (1) {
    const path = solver.solve()
    const dist = totalWalkDist(path)

    if (dist < best_dist) {
      best_dist = dist
      postMessage({"path": path, "dist": dist})
    }
  }
}