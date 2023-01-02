if ('function' === typeof importScripts) {
  importScripts("distance_utils.js",
    "random_utils.js",
    "undirected_graph.js",
    "random_tsp_solver.js",
    "simulated_annealing_solver.js",
    "nearest_neighbor_solver.js",
    "../common/heap.js")
}

onmessage = (e) => {
  const solver_name = e.data.solver_name
  const graph = e.data.graph
  let solver_class
  switch (solver_name) {
    case "random":
      solver_class = RandomTSPSolver
      break;
    case "simulated-annealing":
      solver_class = SimulatedAnnealingSolver
      break;
    case "nearest-neighbor":
      solver_class = NearestNeighborSolver
      break
    default:
      console.error("unexpected solver name provided")
  }

  const solver = new solver_class(graph)
  let best_dist = Infinity
  while (1) {
    const path = solver.solve()

    if (path.length < graph.nodes.length + 1) {
      continue
    }

    if (path[0] != path[path.length - 1]) {
      continue
    }

    if (!isValidPath(path)) {
      continue
    }

    const dist = totalWalkDist(path)

    if (dist < best_dist) {
      best_dist = dist
      postMessage({ "path": path, "dist": dist, "meta": solver.meta })
    }
  }
}