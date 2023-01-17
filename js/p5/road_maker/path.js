class PathNode {
  constructor(x, y, next) {
    this.x = x;
    this.y = y;
    this.next = next;
  }
}

class Path {
  constructor(w = canvas_width, h = canvas_height, cell_point_limit = 200) {
    this.head = new PathNode(0, 0, null)
    this.tail = this.head
    this.length = 0
    this.boundary = new Rectangle(w / 2, h / 2, w / 2, h / 2)
    this.qtree = new Quad(this.boundary, cell_point_limit)
  }

  add(x, y) {
    this.tail.next = new PathNode(x, y, null)
    this.tail = this.tail.next
    this.length++
    this.qtree.insert(this.tail)
  }

  [Symbol.iterator]() {
    let node = this.head.next
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