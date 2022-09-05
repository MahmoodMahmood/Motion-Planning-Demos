const canvas_width = 500
const canvas_height = 500
let num_nodes = 7
let num_edges_per_node = 3

let graph = new UndirectedGraph(num_nodes, num_edges_per_node)

function setup() {
  canvas = createCanvas(canvas_width, canvas_height)
  canvas.parent('sketch-holder');
}

function draw() {
  background(220)
  graph.draw()
}

function resetGraph() {
  graph = new UndirectedGraph(num_nodes, num_edges_per_node)
}

function updateNumNodes(new_num_nodes) {
  num_nodes = new_num_nodes

  const max_edges_per_node = num_nodes-1
  document.getElementById("edges-range").max = max_edges_per_node
  document.getElementById("edges-input").max = max_edges_per_node
  
  updateNumEdgesPerNode(max_edges_per_node)
}

function updateNumEdgesPerNode(new_num_edges_per_nodes) {
  num_edges_per_node = new_num_edges_per_nodes
  document.getElementById("edges-range").value = num_edges_per_node
  document.getElementById("edges-input").value = num_edges_per_node
  resetGraph()
}