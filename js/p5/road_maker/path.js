class PathNode {
  constructor(x, y, next) {
    this.x = x;
    this.y = y;
    this.next = next;
  }
}

class Path {
  constructor(w = canvas_width, h = canvas_height, radius = 30, cell_point_limit = 200) {
    this.head = null
    this.tail = this.head
    this.radius = radius
    this.length = 0
    this.boundary = new Rectangle(w / 2, h / 2, w / 2, h / 2)
    this.qtree = new Quad(this.boundary, cell_point_limit)
  }

  add(x, y) {
    if (this.head == null) {
      this.head = new PathNode(x, y, null)
      this.tail = this.head
    } else {
      this.tail.next = new PathNode(x, y, null)
      this.tail = this.tail.next
    }
    this.length++
    this.qtree.insert(this.tail)
  }

  getNearbyNodes(x, y, radius) {
    let range = new Circle(x, y, radius)
    return this.qtree.query(range)
  }

  [Symbol.iterator]() {
    let node = this.head
    return {
      next() {
        if (node) {
          let result = { value: node, done: false }
          node = node.next
          return result
        } else {
          return { done: true }
        }
      }
    }
  }
}

function nodeSqDist(node, x, y) {
  return (node.x - x) ** 2 + (node.y - y) ** 2
}

function nodeDist(node, x, y) {
  return sqrt(nodeSqDist(node, x, y))
}

function inPath(path, x, y) {
  let nearbyNodes = path.getNearbyNodes(x, y, path.radius * 2)
  return nearbyNodes.some(node => nodeDist(node, x, y) < path.radius)
}