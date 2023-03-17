class StandardRobot {
    /*
     * Standard controls (robot centric) first direct the robot to match the orientation of the
     * joystick,
     * and then use both motors at a speed determined by joystick magnitude to move
     * the robot
     * in a straight line
     *
     * In robot centric mode, this will turn the robot either left or right with angular velocity
     * proportional to the joystick's offset from the vertical axis
     * If the joystick is pulled straight forward or straight backwards,
     * the robot will move in that direction without turning.
     */

    constructor(driver, U, r_tolerance, theta_tolerance) {
        this.robot = driver
        this.max = U
        this.rEpsilon = r_tolerance || 0.1
        this.thetaEpsilon = theta_tolerance || 0.33
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
        const pose = (Math.PI / 2) % (2 * Math.PI)
        const dTheta = Math.abs(theta - pose)
        if (dTheta < this.thetaEpsilon) {
            const power = this.lerp(0, this.max, r)
            return [power, power]
        }

        // check angle tolerance for backwards movement
        const reversed = (theta + Math.PI) % (2 * Math.PI)
        const dThetaBackwards = Math.abs(reversed - pose)
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
        const turnAngle = pose - target
        const power = this.lerp(0, this.max, 2 * Math.abs(turnAngle) / Math.PI);
        if (turnAngle < 0) {
            // left turn
            return [-power, power]
        } else {
            // right turn
            return [power, -power]
        }
    }
}

class Standard {
    /*
     * Standard controls (field centric) first direct the robot to match the orientation of the
     * joystick,
     * and then use both motors at a speed determined by joystick magnitude to move
     * the robot
     * in a straight line
     *
     * In field centric mode, this will turn the robot to match the direction of
     * the joystick within a set tolerance and then move forwards, or backwards--
     * depending on whichever requires less turning--in that direction.
     * 
     * k should be set to a value in the range (0,1], which controls the system response
     * proportional to the turning angle;
     * mu should be set to the minimum turning power, which should only be adjusted after
     * k has been fined tuned
     */

    constructor(driver, U, r_tolerance, theta_tolerance, k, mu) {
        this.robot = driver
        this.max = U
        this.rEpsilon = r_tolerance || 0.1
        this.thetaEpsilon = theta_tolerance || 0.1
        this.K = k || 0.8;
        this.C = mu || 0.2;
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
        const reversed = (theta + Math.PI) % (2 * Math.PI)
        const dThetaBackwards = Math.abs(reversed - pose)
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
        const turnAngle = pose - target
        const power = this.lerp(0, this.K * this.max, 2 * Math.abs(turnAngle) / Math.PI) + this.C;
        if (turnAngle < 0) {
            // left turn
            return [-power, power]
        } else {
            // right turn
            return [power, -power]
        }
    }
}
