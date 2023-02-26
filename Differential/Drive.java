package Differential;

public class Drive {
    // constants
    double length;

    public Drive(double l) {
        // l (m): distance between left and right motors
        length = l;
    }

    public double[] velocities(double omega, double R) {
        // get wheel velocities (m/s) as list [v_l, v_r]
        // omega (s^-1): angular velocity (positive = counterclockwise)
        // R (m): radius of curvature, as measured from robot center;
        // positive values correspond to a center of curvature left of the robot center.
        // In the case that the angular velocity is zero, R determines the overall
        // robot speed.

        if (omega == 0) {
            // Straight line movement; no rotation
            double v_l = R;
            double v_r = R;
            double[] out = { v_l, v_r };
            return out;
        }

        double v_l = omega * (R - length / 2);
        double v_r = omega * (R + length / 2);
        double[] out = { v_l, v_r };
        return out;
    }

    public double[] states(double v_l, double v_r) {
        // inverse of `velocities`; get angular velocity (s^-1) and radius of curvature
        // (m),
        // in that order, from motor velocities
        // v_l (m/s): left motor velocity
        // v_r (m/s): right motor velocity

        if (v_l == v_r) {
            // Straight line movement; no rotation
            double omega = (v_r - v_l) / 2;
            double R = Double.POSITIVE_INFINITY;
            double[] out = { omega, R };
            return out;
        }

        double omega = (v_r - v_l) / length;
        double R = (length / 2) * (v_l + v_r) / (v_r - v_l);
        double[] out = { omega, R };
        return out;
    }
}
