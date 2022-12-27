importScripts("distance_utils.js",
              "random_utils.js",
              "undirected_graph.js",
              "random_tsp_solver.js")

onmessage = (e) => {
  const solver_class = e.data.solver_class
  const graph = e.data.graph
  let solver
  if (solver_class == "random") {
    solver = new RandomTSPSolver(graph)
  }

  let highlighted_path = []
  let prev_path = []
  
  while (1) {
    prev_path = highlighted_path
    highlighted_path = solver.solve()
    if (prev_path != highlighted_path) {
      postMessage(highlighted_path)
    }
  }
  console.log("done")
}