const draw_text = false
const canvas_width = 500
const canvas_height = 500
let selected_node = null
let num_nodes = 7
let highlighted_path = []

let graph = new UndirectedGraph(num_nodes)

function setup() {
  canvas = createCanvas(canvas_width, canvas_height)
  canvas.parent('sketch-holder');

  // mouse click event handlers for canvas
  canvas.mousePressed(canvasMousePressed)
}

function draw() {
  background(220)
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
  graph = new UndirectedGraph(num_nodes)
  highlighted_path = []
}

function updateNumNodes(new_num_nodes) {
  num_nodes = new_num_nodes
  resetGraph()
  document.getElementById("graph-connected-alert").style.visibility = isGraphFullyConnected(graph) ? "hidden" : "visible"
}

function findShortestPath(node1, node2) {
  // find shortest path
  highlighted_path = shortestPathDijkstra(node1, node2)

  // reset selected node for future selections
  resetSelectedNode()
}

function solveTSP(solver_class) {
  let solver = new solver_class(graph)
  highlighted_path = solver.solve()

  // TODO: remove
  let dist = 0
  for (let i = 0; i < highlighted_path.length-1; i++) {
    dist+=calcDist(highlighted_path[i], highlighted_path[i+1])
  }
  console.log(dist)
}