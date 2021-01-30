class AbstractNode {
  constructor(parent) {
    if (new.target === AbstractNode) {
      throw new TypeError("Cannot construct AbstractNode instances directly");
    }
    this.children = []
    this.parent = parent
  }

  addChild(node) {
    this.children.push(node)
  }

  getAllChildren() {
    // the map gets us an array for each of my children's children, need the .flat() to combine those arrays
    return this.children.concat(this.children.map(c => c.getAllChildren()).flat())
  }
  
  getPathFromRoot() {
    let path = [this]
    while (path[path.length - 1].parent) {
      path.push(path[path.length - 1].parent)
    }
    return path.reverse()
  }
}