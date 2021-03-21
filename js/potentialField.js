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
    constructor(target, obstacles, step_size) {
        this.base_field = 5
        this.obstacles = obstacles
        this.step_size = step_size
        this.target = target
        this.k1 = 1
        this.k2 = 100 ** 2
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

    getField(x, y) {
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

    draw() {
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let c = strength_to_color(this.getField(i, j), 0, 500)
                set(i, j, c)
            }
        }
        updatePixels()
    }
}