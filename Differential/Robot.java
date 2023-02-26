package Differential;

public class Robot {
    // constants
    double length;
    double max = 0;
    double x = 0;
    double y = 0;
    double theta = Math.PI / 2;
    double v_l = 0;
    double v_r = 0;

    public Robot(
            double l, double max_v, double x_pos, double y_pos,
            double angle, double V_l, double V_r) {
        // create a robot with initial state
        // l (m): distance between robot motors
        // x_pos, y_pos (m): initial robot position
        // v_l, v_r (m/s): initial robot motor velocities
        length = l;
        max = max_v;
        x = x_pos;
        y = y_pos;
        theta = angle;
        v_l = V_l;
        v_r = V_r;
    }

    public Robot(double l, double max_v, double x_pos, double y_pos, double angle) {
        this(l, max_v, x_pos, y_pos, angle, 0, 0);
    }

    public Robot(double l, double max_v) {
        this(l, max_v, 0, 0, Math.PI / 2, 0, 0);
    }

    public void delta(double V_l, double V_r, double dt) {
        // update robot state with new velocities and positions over a small timestep
        // V_l (m/s): new left motor velocity
        // V_r (m/s): new right motor velocity
        // dt (s): time difference
        if (V_l > max) {
            V_l = max;
        }
        if (V_r > max) {
            V_r = max;
        }
        if (V_l < -max) {
            V_l = -max;
        }
        if (V_r < -max) {
            V_r = -max;
        }

        // update velocity state
        v_l = V_l;
        v_r = V_r;

        // get transformed state
        Drive transformer = new Drive(length);
        double[] transformed = transformer.states(v_l, v_r);
        double omega = transformed[0];
        double R = transformed[1];

        // handle straight line motion separately
        if (omega == 0) {
            // update position states
            double v_x = V_l * Math.cos(theta);
            double v_y = V_l * Math.sin(theta);
            x += v_x * dt;
            y += v_y * dt;
            return;
        }

        // create new state
        double dTheta = omega * dt;
        double[] ICC = { x - R * Math.sin(theta), y + R * Math.cos(theta) };
        double[][] transformMatrix = {
                { Math.cos(dTheta), -Math.sin(dTheta), 0 },
                { Math.sin(dTheta), Math.cos(dTheta), 0 },
                { 0, 0, 1 }
        };
        double[] translatedPos = { x - ICC[0], y - ICC[1], dTheta };
        double[] translationVec = { ICC[0], ICC[1], theta };

        // get final state
        double[] statef = Matrix.addVec(
                Matrix.multiply(transformMatrix, translatedPos),
                translationVec);
        x = statef[0];
        y = statef[1];
        theta = statef[2];
    }

    public interface Driver {
        public double velocity(double[] state);
    }

    public double[] drive(Driver left, Driver right, double start, double end, double dt) {
        // integrate over deltas to get final state given variable left and right motor
        // velocities
        double t = start;
        int timesteps = (int) Math.floor((end - start) / dt);
        double[] state = new double[4];

        for (int n = 0; n < timesteps; n++) {
            state = new double[] { x, y, theta, t };

            double v_l = left.velocity(state);
            double v_r = right.velocity(state);

            this.delta(v_l, v_r, dt);
            t += dt;
        }

        state = new double[] { x, y, theta, t };
        return state;
    }

    public double[] drive(Driver left, Driver right, double start, double end) {
        return this.drive(left, right, start, end, 0.01);
    }

    public double[] drive(Driver left, Driver right, double end) {
        return this.drive(left, right, 0, end, 0.01);
    }

    public double[] driveTo(
            Driver left, Driver right,
            double[] target, double tolerance,
            double end, double dt) {
        // keep driving until the robot reaches within a certain tolerance of a target
        // position
        double t = 0;
        boolean reached = false;

        double X = target[0];
        double Y = target[1];

        double[] state = new double[4];

        if (Math.pow(X - x, 2) + Math.pow(Y - y, 2) <= Math.pow(tolerance, 2)) {
            state = new double[] { x, y, theta, 0 };
            return state;
        }

        while (t <= end && !reached) {
            state = new double[] { x, y, theta, t };

            double v_l = left.velocity(state);
            double v_r = right.velocity(state);

            this.delta(v_l, v_r, dt);
            t += dt;

            if (Math.pow(X - x, 2) + Math.pow(Y - y, 2) <= Math.pow(tolerance, 2)) {
                reached = true;
            }
        }

        state = new double[] { x, y, theta, t };
        return state;
    }

    public double[] driveTo(Driver left, Driver right, double[] target, double tolerance) {
        return this.driveTo(left, right, target, tolerance, 60, 0.01);
    }

    public double[] driveTo(Driver left, Driver right, double[] target) {
        return this.driveTo(left, right, target, length, 60, 0.01);
    }
}
