// create controller class
class Controller {
    constructor(x, y, length, callback) {
        // parameters
        this.x = x;
        this.y = y;
        this.s = length;
        this.callback = callback;

        // defaults
        this.h = 0
        this.v = 0
    }

    // internals
    coordinates = () => [this.h, this.v]
    set = (horizontal, vertical) => {
        this.h = horizontal
        this.v = vertical
        this.callback(horizontal, vertical)
    }
    reset = () => this.set(0, 0)

    // graphics
    hArrow = (X, Y, dX) => {
        // draw arrow base
        let width = this.s / 15
        two.polygon([[X, Y - width], [X, Y + width], [X + dX, Y + width], [X + dX, Y - width]])

        // draw arrowhead
        if (dX > 0) {
            // right arrowhead
            let cX = X + dX
            let height = 3 * width
            two.polygon([
                [cX - width / 4, Y + height], 
                [cX - width / 4, Y - height], 
                [cX - width / 4 + Math.sqrt(3) * height, Y]
            ])
        } else {
            // left arrowhead
            let cX = X + dX
            let height = 3 * width
            two.polygon([
                [cX + width / 4, Y + height], 
                [cX + width / 4, Y - height], 
                [cX + width / 4 - Math.sqrt(3) * height, Y]
            ])
        }
    }
    vArrow = (X, Y, dY) => {
        // draw arrow base
        let width = this.s / 15
        two.polygon([[X - width, Y], [X + width, Y], [X + width, Y + dY], [X - width, Y + dY]])

        // draw arrowhead
        if (dY > 0) {
            // up arrowhead
            let cY = Y + dY
            let height = 3 * width
            two.polygon([
                [X - height, cY - width / 4], 
                [X + height, cY - width / 4], 
                [X, cY - width / 4 + Math.sqrt(3) * height]
            ])
        } else {
            // down arrowhead
            let cY = Y + dY
            let height = 3 * width
            two.polygon([
                [X - height, cY + width / 4], 
                [X + height, cY + width / 4], 
                [X, cY + width / 4 - Math.sqrt(3) * height]
            ])
        }
    }
    draw = (X, Y) => {
        // calculate center offset
        const dX = X - 5
        const dY = Y - 5

        // circular masks
        two.stroke = false
        two.fill = true
        two.fillStyle = '#111'
        two.circle([this.x + dX - 1.5 * this.s, this.y + dY], this.s)
        two.circle([this.x + dX, this.y + dY], this.s)

        // arrows
        two.fillStyle = '#fa0'
        this.hArrow(this.x + dX - 1.5 * this.s, this.y + dY, -this.h)
        two.fillStyle = '#0ca'
        this.vArrow(this.x + dX, this.y + dY, this.v)
    }
}
