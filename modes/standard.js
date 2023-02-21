class Standard {
    /*
     * Standard controls first direct the robot to match the orientation of the joystick,
     * and then use both motors at a speed determined by joystick magnitude to move the robot
     * in a straight line
     * 
     * TODO: implement control method for pose correction,
     * possibly also for deviations from straight path
    */

    constructor(driver, U, r_tolerance, theta_tolerance) {
        this.robot = driver
        this.max = U
        this.rEpsilon = r_tolerance || 5e-2
        this.thetaEpsilon = theta_tolerance || 7e-2
    }

    lerp = (a, b, u) => {
        // standard linear interpolation between a and b by u in [0, 1]
        return a + (b - a) * u
    }
    set = (r, theta, state) => {
        // expects r in [0, 1] and theta measured from right horizontal in [0, 2pi)

        // check magnitude tolerance
        if (r < this.rEpsilon) {
            return [0, 0]
        }

        // check angle tolerance
        const pose = state[2] % (2 * Math.PI)
        const dTheta = Math.abs(theta - pose)
        if (dTheta < this.thetaEpsilon) {
            const power = this.lerp(0, this.max, r)
            return [power, power]
        }

        // check angle tolerance for backwards movement
        const reversed = (pose + Math.PI) % (2 * Math.PI)
        const dThetaBackwards = Math.abs(theta - reversed)
        if (dThetaBackwards < this.thetaEpsilon) {
            const power = this.lerp(0, -this.max, r)
            return [power, power]
        }

        // choose between forwards and backwards movement
        let target
        if (dTheta < dThetaBackwards) {
            target = theta
        } else {
            target = (theta + Math.PI) % (2 * Math.PI)
        }

        // find turning direction to target
        const turnAngle = target - theta
        if (turnAngle < 0) {
            // left turn
            return [-this.max, this.max]
        } else {
            // right turn
            return [this.max, -this.max]
        }
    }
}
