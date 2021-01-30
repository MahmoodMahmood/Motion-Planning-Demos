class Circle {
    constructor(x, y, r) {
        this.x = x
        this.y = y
        this.r = r
    }

    contains(point) {
        return (dist(this.x, this.y, point.x, point.y) < this.r)
    }
}
class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contains(node) {
        return (node.x >= this.x - this.w &&
            node.x <= this.x + this.w &&
            node.y >= this.y - this.h &&
            node.y <= this.y + this.h);
    }

    intersects(circle) { //rectangle-circle intersection
        let testX = circle.x
        let testY = circle.y

        if (circle.x <= this.x - this.w)
            testX = this.x - this.w
        else if (circle.x > this.x + this.w)
            testX = this.x + this.w

        if (circle.y <= this.y - this.h)
            testY = this.y - this.h
        else if (circle.y > this.y + this.h)
            testY = this.y + this.h

        return ((circle.x - testX) ** 2 + (circle.y - testY) ** 2) <= (circle.r) ** 2
    }
}

class Quad {
    constructor(boundary, n) {
        this.boundary = boundary;
        this.capacity = n;
        this.nodes = [];
        this.divided = false;
    }

    subDivide() {
        let w = this.boundary.w / 2;
        let h = this.boundary.h / 2;
        let ne = new Rectangle(this.boundary.x + w, this.boundary.y - h, w, h);
        let nw = new Rectangle(this.boundary.x - w, this.boundary.y - h, w, h);
        let se = new Rectangle(this.boundary.x + w, this.boundary.y + h, w, h);
        let sw = new Rectangle(this.boundary.x - w, this.boundary.y + h, w, h);

        this.northeast = new Quad(ne, this.capacity);
        this.northwest = new Quad(nw, this.capacity);
        this.southeast = new Quad(se, this.capacity);
        this.southwest = new Quad(sw, this.capacity);
        this.divided = true;

        //Passing nodes to children
        for (let node of this.nodes) {
            this.insert(node);
        }
        this.nodes.length = 0;
    }

    insert(node) {
        if (!this.boundary.contains(node))
            return false;
        if (this.nodes.length < this.capacity && !this.divided) {
            this.nodes.push(node);
            return true;
        } else {
            if (!this.divided)
                this.subDivide();

            if (this.northeast.insert(node))
                return true;
            else if (this.northwest.insert(node))
                return true;
            else if (this.southeast.insert(node))
                return true;
            else if (this.southwest.insert(node))
                return true
        }
    }
    query(range, found) {
        if (!found) {
            found = [];
        }
        if (!this.boundary.intersects(range)) {
            return found;
        }
        if (this.divided) {
            found = this.northeast.query(range, found);
            found = this.southwest.query(range, found);
            found = this.northwest.query(range, found);
            found = this.southeast.query(range, found);
        } else {
            found = found.concat(this.nodes.filter(function (node) {
                return range.contains(node);
            }))
        }
        return found;
    }

    /* NO LONGER SUPPORTED!
    //Can be used for debugging purposes
    show() {
        stroke(255);
        strokeWeight(1)
        noFill();
        rectMode(CENTER);
        rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
        if (this.divided) {
            this.northeast.show();
            this.northwest.show();
            this.southeast.show();
            this.southwest.show();
        }
        for (let p of this.nodes) {
            strokeWeight(4)
            node(p.x, p.y)
        }
    }
    */
}