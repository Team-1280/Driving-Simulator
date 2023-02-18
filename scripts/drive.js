class Drive {
    constructor(l) {
        // l (m): distance between left and right motors
        this.length = l
    }

    velocities = (omega, R) => {
        // get wheel velocities (m/s) as list [v_l, v_r]
        // omega (s^-1): angular velocity (positive = counterclockwise)
        // R (m): radius of curvature, as measured from robot center
        // positive values correspond to a center of curvature left of the robot center.
        // In the case that the angular velocity is zero, R determines the overall
        // robot speed.

        if (omega == 0) {
            // Straight line movement no rotation
            const v_l = R
            const v_r = R
            const out = [v_l, v_r]
            return out
        }

        const v_l = omega * (R - this.length / 2)
        const v_r = omega * (R + this.length / 2)
        const out = [v_l, v_r]
        return out
    }

    states = (v_l, v_r) => {
        // inverse of `velocities` get angular velocity (s^-1) and radius of curvature (m),
        // in that order, from motor velocities
        // v_l (m/s): left motor velocity
        // v_r (m/s): right motor velocity

        if (v_l == v_r) {
            // Straight line movement no rotation
            const omega = (v_r - v_l) / 2
            const R = Infinity
            const out = [omega, R]
            return out
        }

        const omega = (v_r - v_l) / this.length
        const R = (this.length / 2) * (v_l + v_r) / (v_r - v_l)
        const out = [omega, R]
        return out
    }
}
