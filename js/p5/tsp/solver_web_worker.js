if( 'function' === typeof importScripts) {
  importScripts("distance_utils.js",
                "random_utils.js",
                "undirected_graph.js",
                "random_tsp_solver.js",
                "simulated_annealing.js",
                "../common/heap.js")
}

onmessage = (e) => {
  const solver_class = e.data.solver_class
  const graph = e.data.graph
  let solver
  if (solver_class == "random") {
    solver = new RandomTSPSolver(graph)
  } else if (solver_class == "simulated-annealing") {
    solver = new SimulatedAnnealingSolver(graph)
  }

  let best_dist = Infinity
  while (1) {
    const path = solver.solve()

    if (path.length < graph.nodes.length + 1) {
      continue
    }

    if (path[0] != path[path.length-1]) {
      continue
    }

    if (!isValidPath(path)) {
      continue
    }

    const dist = totalWalkDist(path)

    if (dist < best_dist) {
      best_dist = dist
      postMessage({"path": path, "dist": dist, "meta": solver.meta})
    }
  }
}