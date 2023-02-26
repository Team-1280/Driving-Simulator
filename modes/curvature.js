class Curvature {
    /*
     * Curvature drive, based on "cheesy" drive, allows setting the velocity in the robot's
     * current direction of travel separately from the robot's angular velocity which changes
     * its rate of heading change.
     * It is best implemented on a controller where one stick is used to set each parameter.
     * Using this drive mode with a joystick will require significant adaptations.
     * 
     * TODO: Add control method to maintain angular and tangential velocities
    */

    constructor(driver, U, r_tolerance, theta_tolerance) {
        this.robot = driver
        this.max = U
        this.rEpsilon = r_tolerance || 0.1
        this.thetaEpsilon = theta_tolerance || 0.1
    }

    lerp = (a, b, u) => {
        // standard linear interpolation between a and b by u in [0, 1]
        return a + (b - a) * u
    }
    set = (r, theta, state) => {
        // expects both r and theta in [-1, 1]
        // both are independent parameters and should be controlled separately for
        // maximum range of movement

        /*
         * Unlike in other methods, r and theta do not represent magnitude and angle.
         * Instead, they represent two independent parameters the first is the robot's
         * tangential velocity and the other is the robot's angular velocity. 
        */

        // check magnitude tolerance
        if (Math.abs(r) < this.rEpsilon) {
            r = 0
        } if (Math.abs(theta) < this.thetaEpsilon) {
            theta = 0
        }

        // straight line movement
        if (theta == 0) {
            const v_k = r / 2 + 1 / 2
            const power = this.lerp(-this.max, this.max, v_k)
            return [power, power]
        }

        // calculate new parameters
        const R = r / theta
        let velocities = this.robot.velocities(theta, R)

        // calculate scaling factor
        const r_scaled = Math.abs(r)
        const theta_scaled = Math.abs(theta)
        const k = (r_scaled + theta_scaled) / 2

        // scale output
        velocities[0] *= k
        velocities[1] *= k

        return velocities
    }
}