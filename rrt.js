class Tree {
  constructor(root, canvas_width, canvas_height, cell_point_limit, step_size) {
    this.root = root
    this.boundary = new Rectangle(canvas_width / 2, canvas_height / 2, canvas_width / 2, canvas_height / 2)
    this.qtree = new Quad(this.boundary, cell_point_limit)
    this.step_size = step_size
  }

  getAllNodes() {
    return [this.root].concat(this.root.getAllChildren())
  }

  getNearbyNodes(x, y, radius) {
    let range = new Circle(x, y, radius)
    return this.qtree.query(range)
  }

  findNearestNode(x, y) {
    // https://stackoverflow.com/questions/8864430/compare-javascript-array-of-objects-to-get-min-max
    let radius = 10
    while (radius < min(this.boundary.w, this.boundary.h) * 2) {
      radius *= 2
      let nearbyNodes = this.getNearbyNodes(x, y, radius)
      if (nearbyNodes.length) {
        return nearbyNodes.reduce((prev, curr) => prev.dist(x, y) < curr.dist(x, y) ? prev : curr)
      }
    }
    return this.root
  }

  addNode(target, obstacles) {
    let tries = 0;
    while (++tries < 100) { // keep looping until we find a valid node to add
      let sampleTgt = Math.random() < 0.1 // 10% chance to sample the target point
      let x = sampleTgt ? target.x : Math.random() * 400
      let y = sampleTgt ? target.y : Math.random() * 400

      // TEMP_NODE = new Node(x, y, null) // for visualization purposes
      // TEMP_NODE.color = 'red'

      // Core of RRT algorithm, see paper for details
      let nearest_node = this.findNearestNode(x, y)
      let robot = new PointRobot(nearest_node)
      robot.stepToward({x: x, y: y}, this.step_size)

      // make sure the new node is not in any obstacle, if it is then we retry everything
      if (!robot.inCollision(obstacles)) {
        let new_node = new Node(robot.x, robot.y, nearest_node)
        nearest_node.addChild(new_node)
        this.qtree.insert(new_node);
        return new_node
      }
    } 
    alert("failed to add node!")
  }

  findTarget(target, obstacles, maxNodes = 10, acceptable_range = 20) {
    let nearestNode = this.findNearestNode(target.x, target.y)
    if (nearestNode.dist(target.x, target.y) <= acceptable_range) {
      return nearestNode.getPathFromRoot()
    }

    for (let i = 0; i < maxNodes; i++) {
      let newNode = this.addNode(target, obstacles)
      if (newNode.dist(target.x, target.y) < acceptable_range) {
        return newNode.getPathFromRoot()
      }
    }
  }

  draw() {
    this.root.drawRecursive()
  }
}