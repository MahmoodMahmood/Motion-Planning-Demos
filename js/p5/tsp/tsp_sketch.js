const draw_text = false
const canvas_width = 500
const canvas_height = 500
let selected_node = null
let num_nodes = 7

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
}

function canvasMousePressed() {
  const buffer = 10
  const nearest_node = graph.getNearestNode(mouseX, mouseY)
  if (sqrt((nearest_node.x-mouseX)**2 + (nearest_node.y-mouseY)**2) < nearest_node.draw_config.radius + buffer) {
    if (selected_node != null) {
      selected_node.draw_config.stroke = 1
    }
    selected_node = nearest_node
    selected_node.draw_config.stroke = 3
  }
}

function resetGraph() {
  graph = new UndirectedGraph(num_nodes)
  drawable_path = []
  distance_cache = {}
}

function updateNumNodes(new_num_nodes) {
  num_nodes = new_num_nodes
  resetGraph()
  document.getElementById("graph-connected-alert").style.visibility = isGraphFullyConnected(graph) ? "hidden" : "visible"
}

function findRandomShortestPath() {
  const path = shortestPathDijkstra(graph.nodes[0], graph.nodes[graph.nodes.length-1])
  path.forEach(node => node.draw_config.color = "green")
  path[0].draw_config.color = "red"
}