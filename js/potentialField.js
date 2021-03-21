function strength_to_color(strength, min_range, max_range) {
    strength = strength > max_range ? max_range : strength
    strength = strength < min_range ? min_range : strength
    let fraction = (strength - min_range) / max_range
    fraction = Math.round(fraction * 20) / 20

    colorMode(HSB)
    let c = color((1 - fraction) * 240 + 20, 100, 100)
    colorMode(RGB)
    return c
}

class PotentialField {
    constructor(target, obstacles) {
        this.base_field = 5
        this.obstacles = obstacles
        this.target = target
        this.k1 = 1
        this.k2 = 100 ** 2
        this.bg_cache = null
        this.cur_hash = 0
    }

    getAttractiveField(x, y) {
        return this.k1 * this.target.dist({ x: x, y: y })
    }

    getRepulsiveField(x, y) {
        let res = 0
        this.obstacles.forEach(o => {
            let d = o.distSquared(x, y)
            if (d > 0) {
                res += (1 / d)
            } else {
                return 100000
            }
        })
        return res * this.k2
    }

    getFieldAtPt(x, y) {
        return this.base_field + this.getAttractiveField(x, y) + this.getRepulsiveField(x, y)
    }

    getAttractiveForce(x, y) {
        let diff_mag = sqrt((this.target.x - x) ** 2 + (this.target.y - y) ** 2)
        return [this.k1 * (this.target.x - x) / diff_mag, this.k1 * (this.target.y - y) / diff_mag]
    }

    getRepulsiveForce(x, y) {
        let x_res = 0
        let y_res = 0
        obstacles.forEach(o => {
            if (o.inObstacle(x, y)) {
                return 0
            }
            let [nearestX, nearestY] = o.getNearestPt(x, y)
            let diff_mag = sqrt((nearestX - x) ** 2 + (nearestY - y) ** 2)
            let dist_cu = o.dist(x, y) ** 3
            let factor = this.k2 / (dist_cu * diff_mag)
            x_res += factor * (x - nearestX)
            y_res += factor * (y - nearestY)
        })
        return [x_res, y_res]
    }

    getForce(x, y) {
        let f_att = this.getAttractiveForce(x, y)
        let f_rep = this.getRepulsiveForce(x, y)
        return [f_att[0] + f_rep[0], f_att[1] + f_rep[1]]
    }

    // returns the field at every point
    getField(min_x, min_y, max_x, max_y) {
        let field = [...Array(max_x - min_x)]
        for (let i = min_x; i < max_x; i++) {
            field[i] = [...Array(max_y - min_y)]
            for (let j = min_y; j < max_y; j++) {
                field[i][j] = this.getFieldAtPt(i, j)
            }
        }
        return field
    }

    getColorMap(min_x, min_y, max_x, max_y) {
        let field = this.getField(min_x, min_y, max_x, max_y)
        let res = [...Array(max_x - min_x)]
        for (let i = min_x; i < max_x; i++) {
            res[i] = [...Array(max_y - min_y)]
            for (let j = min_y; j < max_y; j++) {
                res[i][j] = strength_to_color(field[i][j], 0, 500)
            }
        }
        return res
    }

    // Just a random deterministic hashing I made up, hash collisions should be basically impossible with this
    getStateHash() {
        let hash = 0
        this.obstacles.forEach(o => {
            hash ^= (o.x1 << 5) ^ (o.y1 << 10) ^ (o.x2 << 15) ^ (o.y1 << 20)
        })
        hash ^= this.target.x ^ (this.target.y << 2) ^ (this.k1 << 4) ^ (this.k2 << 8)
        return hash
    }

    draw() {
        let new_hash = this.getStateHash()
        if (new_hash != this.cur_hash || this.bg_cache == null) {
            this.bg_cache = this.getColorMap(0, 0, width, height)
        }
        this.cur_hash = new_hash
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                set(i, j, this.bg_cache[i][j])
            }
        }
        updatePixels()
    }
}