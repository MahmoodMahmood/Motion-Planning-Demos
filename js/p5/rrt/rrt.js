class Tree {
  constructor(root, canvas_width, canvas_height, cell_point_limit, step_size) {
    this.root = root
    this.boundary = new Rectangle(canvas_width / 2, canvas_height / 2, canvas_width / 2, canvas_height / 2)
    this.qtree = new Quad(this.boundary, cell_point_limit)
    this.qtree.insert(this.root)
    this.step_size = step_size
    this.count = 1
  }

  getAllNodes() {
    return [this.root].concat(this.root.getAllChildren())
  }

  getNearbyNodes(x, y, radius) {
    let range = new Circle(x, y, radius)
    return this.qtree.query(range)
  }

  findNearestNode(state, use_dist_node_select = false) {
    // https://stackoverflow.com/questions/8864430/compare-javascript-array-of-objects-to-get-min-max
    let radius = 10
    while (radius < min(this.boundary.w, this.boundary.h) * 2) {
      radius *= 2
      let nearbyNodes = this.getNearbyNodes(state.x, state.y, radius)
      if (nearbyNodes.length > 10 || nearbyNodes.length == this.count) {
        if (use_dist_node_select) {
          return nearbyNodes.reduce((prev, curr) => prev.distNodeSelect(state) < curr.distNodeSelect(state) ? prev : curr)
        } else {
          return nearbyNodes.reduce((prev, curr) => prev.dist(state) < curr.dist(state) ? prev : curr)
        }
      }
    }
    return this.root
  }

  addNode(obstacles) {
    let tries = 0;
    while (++tries < 100) { // keep looping until we find a valid node to add
      let random_state = (Math.random() < global_config.tgt_prob) ?
        target :
        this.root.getRandomState({ x_max: canvas_width, y_max: canvas_height })

      // stupid hack to get carNode to work when target is a pointNode, fix later!
      if (target.theta == null) {
        target.theta = this.root.theta
      }

      // Core of RRT algorithm, see paper for details
      // If we have a special node selection distance function available, use it
      let nearest_node = this.findNearestNode(random_state, this.root.distNodeSelect != undefined)
      let new_node = nearest_node.copy()
      new_node.config.color = 'blue'
      new_node.stepToward(random_state, this.step_size)
      // TEMP_NODE code could be better but meh
      TEMP_NODE = new_node instanceof CarNode ?
        new CarNode(random_state, { ...new_node.config }, null) :
        new PointNode(random_state, { ...new_node.config }, null)

      // make sure the new node is not in any obstacle, if it is then we retry everything
      if (!new_node.inCollision(obstacles)) {
        new_node.parent = nearest_node
        nearest_node.addChild(new_node)
        this.qtree.insert(new_node);
        this.count++
        return new_node
      }
    }
    alert("failed to add node!")
  }

  findTarget(target, obstacles, maxNodes = 10, acceptable_range = 20) {
    let nearestNode = this.findNearestNode(target)
    if (nearestNode.dist(target) <= acceptable_range) {
      return nearestNode.getPathFromRoot()
    }

    for (let i = 0; i < maxNodes; i++) {
      let newNode = this.addNode(obstacles)
      if (newNode.dist(target) < acceptable_range) {
        return newNode.getPathFromRoot()
      }
    }
  }

  draw() {
    this.root.drawRecursive()
  }
}