class Arcade {
    /*
     * This features a modified version of arcade drive where one joystick is used to control
     * two parameters: the angular velocity and turn radius of the this.robot.
     * When the joystick is moved straight forward, angular velocity is zero
     * and the magnitude of the joystick is used to set motor velocities.
     * For positions in the top right quadrant of the joystick's movement area,
     * increasing joystick angle from top center sets more negative angular velocity and turn
     * radius is decreased linearly with joystick magnitude starting at zero for zero magnitude
     * and ending at the most negative value that this.maximizes the motor velocity for full
     * magnitude.
     * The top left quadrant features the opposite behavior for left turns instead of right
     * turns.
     * The bottom half mirrors the behavior of the top half except that motor velocities should
     * be set to the opposite (negative) of what they would be set to if the joystick was
     * reflected across the center line into the top half.
     * 
     * TODO: Add control method to maintain correct angular velocity and turning radius
    */

    constructor(driver, U, r_tolerance, theta_tolerance) {
        this.robot = driver
        this.max = U
        this.rEpsilon = r_tolerance || 5e-2
        this.thetaEpsilon = theta_tolerance || 5e-2
    }

    lerp = (a, b, u) => {
        // standard linear interpolation between a and b by u in [0, 1]
        return a + (b - a) * u
    }
    setVertical = (r) => {
        // expects r in [0, 1]
        const power = this.lerp(0, this.max, r)
        return [power, power]
    }
    setQ1 = (r, theta) => {
        // expects r in [0, 1] and theta measured from vertical in [0, pi/2]

        // check angle tolerance
        if (theta < this.thetaEpsilon) {
            return this.setVertical(r)
        }

        // min and this.max are used only in reference to magnitude

        // calculate angular velocity
        const omega_min = 0
        const omega_max = this.robot.states(this.max, -this.max)[0]
        const u = theta / (Math.PI / 2)
        const omega = this.lerp(omega_min, omega_max, u)

        // calculate turn radius
        const R_min = 0
        const R_max = (2 * this.max + omega * this.robot.s) / (2 * omega)
        const R = this.lerp(R_min, R_max, r)

        // get velocities
        return this.robot.velocities(omega, R)
    }
    setQ2 = (r, theta) => {
        // expects r in [0, 1] and theta measured from vertical in [0, pi/2]

        // check angle tolerance
        if (theta < this.thetaEpsilon) {
            return this.setVertical(r)
        }

        // min and this.max are used only in reference to magnitude

        // calculate angular velocity
        const omega_min = 0
        const omega_max = this.robot.states(-this.max, this.max)[0]
        const u = theta / (Math.PI / 2)
        const omega = this.lerp(omega_min, omega_max, u)

        // calculate turn radius
        const R_min = 0
        const R_max = (2 * this.max - omega * this.robot.s) / (2 * omega)
        const R = this.lerp(R_min, R_max, r)

        // get velocities
        return this.robot.velocities(omega, R)
    }
    setTop = (r, theta) => {
        // expects r in [0, 1] and theta measured from right horizontal in [0, pi)
        if (theta <= Math.PI / 2) {
            return this.setQ1(r, Math.PI / 2 - theta)
        } else {
            return this.setQ2(r, theta - Math.PI / 2)
        }
    }
    set = (r, theta, state) => {
        // expects r in [0, 1] and theta measured from right horizontal

        // get robot pose (correct for field-oriented controls)
        const pose = state[2] % (2 * Math.PI)
        const nTheta = (2 * Math.PI + theta - pose + Math.PI / 2) % (2 * Math.PI)

        // check magnitude tolerance
        if (r < this.rEpsilon) {
            return [0, 0]
        }

        if (nTheta < Math.PI) {
            return this.setTop(r, nTheta)
        } else {
            const equivalents = this.setTop(r, 2 * Math.PI - nTheta)
            const bottom = [-equivalents[0], -equivalents[1]]
            return bottom
        }
    }
}
