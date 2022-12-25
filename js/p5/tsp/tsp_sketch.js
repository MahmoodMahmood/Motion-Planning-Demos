const draw_text = true
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
  for (let i = 0; i < highlighted_path.length - 1; i++) {
    drawEdge(highlighted_path[i], highlighted_path[i+1], 3)
  }
}

function canvasMousePressed() {
  const buffer = 10
  const nearest_node = graph.getNearestNode(mouseX, mouseY)
  let prev_node = null
  if (sqrt((nearest_node.x-mouseX)**2 + (nearest_node.y-mouseY)**2) < nearest_node.draw_config.radius + buffer) {
    if (selected_node != null) {
      prev_node = selected_node
      selected_node.draw_config.stroke = 1
    }
    selected_node = nearest_node
    selected_node.draw_config.stroke = 3
    console.log(nearest_node)

    if (prev_node != null) findShortestPath(prev_node, selected_node)
  }
}

function resetGraph() {
  graph = new UndirectedGraph(num_nodes)
  highlighted_path = []
  distance_cache = {}
}

function updateNumNodes(new_num_nodes) {
  num_nodes = new_num_nodes
  resetGraph()
  document.getElementById("graph-connected-alert").style.visibility = isGraphFullyConnected(graph) ? "hidden" : "visible"
}

function findShortestPath(node1, node2) {
  // reset node colors
  graph.nodes.forEach(node => node.draw_config.color = "blue")
  // find shortest path
  const path = shortestPathDijkstra(node1, node2)
  // highlight graph nodes
  path.forEach(node => node.draw_config.color = "green")
  // highlight the start differently because why not
  path[0].draw_config.color = "red"
  // set highlighted_path so that the edges are bold
  highlighted_path = path
  // reset selected node for future selections
  if (selected_node) selected_node.draw_config.stroke = 1
  selected_node = null
  
  



  // TODO: remove
  let dist = 0
  for (let i = 0; i < path.length-1; i++) {
    dist+=calcDist(path[i], path[i+1])
  }
  console.log(dist)
}