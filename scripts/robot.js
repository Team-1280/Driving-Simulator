// create robot class
class Robot {
    constructor(x, y, theta, size) {
        // parameters
        this.x = x
        this.y = y
        this.theta = theta
        this.s = size
        this.v_l = 0
        this.v_r = 0
    }

    // internals
    move = (X, Y) => {
        this.x = X 
        this.y = Y
    }
    reset = () => this.move(0, 0)

    // drive mechanics
    delta = (V_l, V_r, dt) => {
        // update robot state with new velocities and positions over a small timestep
        // V_l (m/s): new left motor velocity
        // V_r (m/s): new right motor velocity
        // dt (s): time difference
        if (V_l > this.max) {
            V_l = this.max
        } if (V_r > this.max) {
            V_r = this.max
        } if (V_l < -this.max) {
            V_l = -this.max
        } if (V_r < -this.max) {
            V_r = -this.max
        }

        // update velocity state
        this.v_l = V_l
        this.v_r = V_r

        // get transformed state
        const transformer = new Drive(this.s)
        const transformed = transformer.states(this.v_l, this.v_r)
        const omega = transformed[0]
        const R = transformed[1]

        // handle straight line motion separately
        if (omega == 0) {
            // update position states
            const v_x = V_l * Math.cos(this.theta)
            const v_y = V_l * Math.sin(this.theta)
            this.x += v_x * dt
            this.y += v_y * dt
            return
        }

        // create new state
        const dTheta = omega * dt
        const ICC = [this.x - R * Math.sin(this.theta), this.y + R * Math.cos(this.theta)]
        const transformMatrix = [
            [Math.cos(dTheta), -Math.sin(dTheta), 0],
            [Math.sin(dTheta), Math.cos(dTheta), 0],
            [0, 0, 1]
        ]
        const translatedPos = [this.x - ICC[0], this.y - ICC[1], dTheta]
        const translationVec = [ICC[0], ICC[1], this.theta]

        // get final state
        const statef = addVec(
            multiplyMatrix(transformMatrix, translatedPos),
            translationVec
        )
        
        // return
        this.x = statef[0]
        this.y = statef[1]
        this.theta = statef[2]
    }

    // graphics
    rotate = (coordinate, angle, center) => {
        // rotate `coordinate` by an `angle` about `center`
        
        // translate
        const translated = [coordinate[0] - center[0], coordinate[1] - center[1]]

        // rotate
        const rotationMatrix = [
            [Math.cos(angle), -Math.sin(angle)],
            [Math.sin(angle), Math.cos(angle)]
        ]
        const rotated = multiplyMatrix(rotationMatrix, translated)

        // translate back
        const out = [rotated[0] + center[0], rotated[1] + center[1]]
        return out
    }

    draw = () => {
        // positioning
        const x = this.x
        const y = this.y
        const r = this.s / 2
        const T = this.theta - Math.PI / 2

        // center
        const center = [x, y]

        // wheels
        two.fill = true
        two.stroke = false
        two.fillStyle = '#555'
        const x_w_left = x - r * 1.25
        const y_w = y - r * 0.75
        const w_w = r * 0.25
        const h_w = r * 1.5
        two.polygon([
            this.rotate([x_w_left, y_w], T, center),
            this.rotate([x_w_left + w_w, y_w], T, center),
            this.rotate([x_w_left + w_w, y_w + h_w], T, center),
            this.rotate([x_w_left, y_w + h_w], T, center)
        ])

        const x_w_right = x + r * 1.25 - w_w
        two.polygon([
            this.rotate([x_w_right, y_w], T, center),
            this.rotate([x_w_right + w_w, y_w], T, center),
            this.rotate([x_w_right + w_w, y_w + h_w], T, center),
            this.rotate([x_w_right, y_w + h_w], T, center)
        ])

        // frame
        two.stroke = true
        two.lineWidth = size / 100
        two.strokeStyle = '#ccc'
        two.fillStyle = '#999'
        two.polygon([
            this.rotate([x - r, y - r], T, center),
            this.rotate([x + r, y - r], T, center),
            this.rotate([x + r, y + r], T, center),
            this.rotate([x - r, y + r], T, center)
        ])

        // axes
        const x_a = x - r * 0.5
        const y_a_top = y + r * 0.75
        const w_a = r
        const h_a = r * 0.25
        two.fillStyle = '#f00'
        two.stroke = false
        two.polygon([
            this.rotate([x_a, y_a_top], T, center),
            this.rotate([x_a + w_a, y_a_top], T, center),
            this.rotate([x_a + w_a, y_a_top + h_a], T, center),
            this.rotate([x_a, y_a_top + h_a], T, center)
        ])

        const y_a_bottom = y - r * 0.75 - h_a
        two.fillStyle = '#00f'
        two.polygon([
            this.rotate([x_a, y_a_bottom], T, center),
            this.rotate([x_a + w_a, y_a_bottom], T, center),
            this.rotate([x_a + w_a, y_a_bottom + h_a], T, center),
            this.rotate([x_a, y_a_bottom + h_a], T, center)
        ])
    }
}
