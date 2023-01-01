const draw_text = false
const canvas_width = 500
const canvas_height = 500
let myWorker = null

let selected_node = null
let num_nodes = 7
let num_edges = 7
let highlighted_path = []
let allow_intersections = true

let graph = new UndirectedGraph(num_nodes, num_edges, allow_intersections)

function setup() {
  canvas = createCanvas(canvas_width, canvas_height)
  canvas.parent('sketch-holder');

  // mouse click event handlers for canvas
  canvas.mousePressed(canvasMousePressed)
}

function draw() {
  background(160)
  graph.draw()
  drawHighlightedPath(highlighted_path)
}

function canvasMousePressed() {
  const buffer = 10
  const nearest_node = graph.getNearestNode(mouseX, mouseY)
  let prev_node = null
  if (nodeDist(nearest_node, mouseX, mouseY) < nearest_node.draw_config.radius + buffer) {
    if (selected_node != null) {
      prev_node = selected_node
      selected_node.draw_config.stroke = 1
    }
    selected_node = nearest_node
    selected_node.draw_config.stroke = 3

    if (prev_node != null) findShortestPath(prev_node, selected_node)
  }
}

function resetSelectedNode() {
  if (selected_node) selected_node.draw_config.stroke = 1
  selected_node = null
}

function resetGraph() {
  graph = new UndirectedGraph(num_nodes, num_edges, allow_intersections)
  const is_connected = isGraphFullyConnected(graph)
  highlighted_path = []
  document.querySelectorAll(".text-reset-with-graph").forEach(el => el.innerText = "")
  document.querySelectorAll(".checked-reset-with-graph").forEach(el => {
    el.checked = false
    el.disabled = !is_connected
  })
  
  document.querySelector("#graph-connected-alert").style.visibility = is_connected ? "hidden" : "visible"

  restartWorker()
}

function updateNumNodes(new_num_nodes) {
  num_nodes = new_num_nodes
  resetGraph()
}

function updateNumEdges(new_num_edges) {
  num_edges = new_num_edges
  resetGraph()
}

function findShortestPath(node1, node2) {
  // find shortest path
  highlighted_path = dijkstra(node1, node2)

  // reset selected node for future selections
  resetSelectedNode()
}

function restartWorker() {
  // terminate and restart web worker to get it ready for the next job
  if (myWorker) myWorker.terminate()
  myWorker = new Worker("js/p5/tsp/solver_web_worker.js")
}

function solveTSP(solver_class) {
  restartWorker()
  const check_box_element = document.querySelector("#toggle-solver-" + solver_class)
  if (!check_box_element.checked) {
    return
  }

  myWorker.postMessage({ "solver_class": solver_class, "graph": graph })
  myWorker.onmessage = (e) => {
    highlighted_path = e.data.path
    document.querySelector("#path-dist-" + solver_class).innerText = e.data.dist.toFixed(2)
    document.querySelector("#meta-" + solver_class).innerText = e.data.meta
  }

  document.querySelectorAll(".solver").forEach(el => {
    if (el != check_box_element) {
      el.checked = false
    }
  })
}

function allowIntersection() {
  allow_intersections = document.querySelector("#toggle-allow-intersections").checked
  resetGraph()
}