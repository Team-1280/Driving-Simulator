// create joystick class
class Joystick {
    constructor(x, y, radius, callback) {
        // parameters
        this.x = x;
        this.y = y;
        this.s = radius;
        this.callback = callback;

        // defaults
        this.r = 0
        this.theta = 0
    }

    // internals
    coordinates = () => {
        const X = this.r * Math.cos(this.theta)
        const Y = this.r * Math.sin(this.theta)
        return [X, Y]
    }
    set = (R, Theta) => {
        this.r = R
        this.theta = Theta
        this.callback(R, Theta)
    }
    reset = () => this.set(0, 0)

    // graphics
    draw = () => {
        // frame
        two.stroke = false
        two.fill = true
        two.fillStyle = '#111'
        two.circle([this.x, this.y], this.s)

        // state
        two.fillStyle = '#08f'
        const loc = this.coordinates()
        two.circle([this.x + loc[0], this.y + loc[1]], this.s / 8)
    }
}
