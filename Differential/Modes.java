package Differential;

public class Modes {
    // All modes use field-oriented controls
    // TODO: state-based control modes (take into account robot state before making corrections)

    public class Standard {
        /*
         * Standard controls first direct the robot to match the orientation of the joystick,
         * and then use both motors at a speed determined by joystick magnitude to move the robot
         * in a straight line
         * 
         * TODO: implement control method for pose correction,
         * possibly also for deviations from straight path
        */
    
        Drive robot;
        double max;
        double rEpsilon;
        double thetaEpsilon;
    
        public Standard(Drive driver, double U, double r_tolerance, double theta_tolerance) {
            robot = driver;
            max = U;
            rEpsilon = r_tolerance;
            thetaEpsilon = theta_tolerance;
        }
        public Standard(Drive driver, double U) {
            this(driver, U, 0.1, 0.1);
        }
    
        double lerp(double a, double b, double u) {
            // standard linear interpolation between a and b by u in [0, 1]
            return a + (b - a) * u;
        }
        public double[] set(double r, double theta, double[] state) {
            // expects r in [0, 1] and theta measured from right horizontal in [0, 2pi)
    
            // check magnitude tolerance
            if (r < rEpsilon) {
                return new double[] {0, 0};
            }

            // check angle tolerance
            double pose = state[2] % (2 * Math.PI);
            double dTheta = Math.abs(theta - pose);
            if (dTheta < thetaEpsilon) {
                double power = lerp(0, max, r);
                return new double[] {power, power};
            }
    
            // check angle tolerance for backwards movement
            double reversed = (theta + Math.PI) % (2 * Math.PI);
            double dThetaBackwards = Math.abs(reversed - pose);
            if (dThetaBackwards < thetaEpsilon) {
                double power = lerp(0, -max, r);
                return new double[] {power, power};
            }
    
            // choose between forwards and backwards movement
            double target;
            if (dTheta < dThetaBackwards) {
                target = theta;
            } else {
                target = (theta + Math.PI) % (2 * Math.PI);
            }
    
            // find turning direction to target
            double turnAngle = pose - target;
            if (turnAngle < 0) {
                // left turn
                return new double[] {-max, max};
            } else {
                // right turn
                return new double[] {max, -max};
            }
        }
    }

    public class Arcade {
        /*
         * This features a modified version of arcade drive where one joystick is used to control
         * two parameters: the angular velocity and turn radius of the robot.
         * When the joystick is moved straight forward, angular velocity is zero
         * and the magnitude of the joystick is used to set motor velocities.
         * For positions in the top right quadrant of the joystick's movement area,
         * increasing joystick angle from top center sets more negative angular velocity and turn
         * radius is decreased linearly with joystick magnitude starting at zero for zero magnitude
         * and ending at the most negative value that maximizes the motor velocity for full
         * magnitude.
         * The top left quadrant features the opposite behavior for left turns instead of right
         * turns.
         * The bottom half mirrors the behavior of the top half except that motor velocities should
         * be set to the opposite (negative) of what they would be set to if the joystick was
         * reflected across the center line into the top half.
         * 
         * TODO: Add control method to maintain correct angular velocity and turning radius
        */
    
        Drive robot;
        double max;
        double rEpsilon;
        double thetaEpsilon;
    
        public Arcade(Drive driver, double U, double r_tolerance, double theta_tolerance) {
            robot = driver;
            max = U;
            rEpsilon = r_tolerance;
            thetaEpsilon = theta_tolerance;
        }
        public Arcade(Drive driver, double U) {
            this(driver, U, 5e-2, 7e-2);
        }
    
        double lerp(double a, double b, double u) {
            // standard linear interpolation between a and b by u in [0, 1]
            return a + (b - a) * u;
        }
        double[] setVertical(double r) {
            // expects r in [0, 1]
            double power = lerp(0, max, r);
            return new double[] {power, power};
        }
        double[] setQ1(double r, double theta) {
            // expects r in [0, 1] and theta measured from vertical in [0, pi/2]

            // check angle tolerance
            if (theta < thetaEpsilon) {
                return setVertical(r);
            }

            // min and max are used only in reference to magnitude

            // calculate angular velocity
            double omega_min = 0;
            double omega_max = robot.states(max, -max)[0];
            double u = theta / (Math.PI / 2);
            double omega = lerp(omega_min, omega_max, u);

            // calculate turn radius
            double R_min = 0;
            double R_max = (2 * max + omega * robot.length) / (2 * omega);
            double R = lerp(R_min, R_max, r);

            // get velocities
            return robot.velocities(omega, R);
        }
        double[] setQ2(double r, double theta) {
            // expects r in [0, 1] and theta measured from vertical in [0, pi/2]

            // check angle tolerance
            if (theta < thetaEpsilon) {
                return setVertical(r);
            }

            // min and max are used only in reference to magnitude

            // calculate angular velocity
            double omega_min = 0;
            double omega_max = robot.states(-max, max)[0];
            double u = theta / (Math.PI / 2);
            double omega = lerp(omega_min, omega_max, u);

            // calculate turn radius
            double R_min = 0;
            double R_max = (2 * max - omega * robot.length) / (2 * omega);
            double R = lerp(R_min, R_max, r);

            // get velocities
            return robot.velocities(omega, R);
        }
        double[] setTop(double r, double theta) {
            // expects r in [0, 1] and theta measured from right horizontal in [0, pi)
            if (theta <= Math.PI / 2) {
                return setQ1(r, Math.PI / 2 - theta);
            } else {
                return setQ2(r, theta - Math.PI / 2);
            }
        }
        public double[] set(double r, double theta, double[] state) {
            // expects r in [0, 1] and theta measured from right horizontal

            // get robot pose (correct for field-oriented controls)
            double pose = state[2] % (2 * Math.PI);
            double nTheta = (2 * Math.PI + theta - pose + Math.PI / 2) % (2 * Math.PI);

            // check magnitude tolerance
            if (r < rEpsilon) {
                return new double[] {0, 0};
            }

            if (nTheta < Math.PI) {
                return setTop(r, nTheta);
            } else {
                double[] equivalents = setTop(r, 2 * Math.PI - nTheta);
                double[] bottom = {-equivalents[0], -equivalents[1]};
                return bottom;
            }
        }
    }

    public class Curvature {
        /*
         * Curvature drive, based on "cheesy" drive, allows setting the velocity in the robot's
         * current direction of travel separately from the robot's angular velocity which changes
         * its rate of heading change.
         * It is best implemented on a controller where one stick is used to set each parameter.
         * Using this drive mode with a joystick will require significant adaptations.
         * 
         * TODO: Add control method to maintain angular and tangential velocities
        */
    
        Drive robot;
        double max;
        double rEpsilon;
        double thetaEpsilon;
    
        public Curvature(Drive driver, double U, double r_tolerance, double theta_tolerance) {
            robot = driver;
            max = U;
            rEpsilon = r_tolerance;
            thetaEpsilon = theta_tolerance;
        }
        public Curvature(Drive driver, double U) {
            this(driver, U, 5e-2, 5e-2);
        }
    
        double lerp(double a, double b, double u) {
            // standard linear interpolation between a and b by u in [0, 1]
            return a + (b - a) * u;
        }
        public double[] set(double r, double theta, double[] state) {
            // expects both r and theta in [-1, 1]
            // both are independent parameters and should be controlled separately for
            // maximum range of movement
 
            /*
             * Unlike in other methods, r and theta do not represent magnitude and angle.
             * Instead, they represent two independent parameters; the first is the robot's
             * tangential velocity and the other is the robot's angular velocity. 
            */

            // check magnitude tolerance
            if (Math.abs(r) < rEpsilon) {
                r = 0;
            } if (Math.abs(theta) < thetaEpsilon) {
                theta = 0;
            }

            // straight line movement
            if (theta == 0) {
                double v_k = r / 2 + 1 / 2;
                double power = lerp(-max, max, v_k);
                return new double[] {power, power};
            }
    
            // calculate parameter bounds
            double theta_k = theta / 2 + 1 / 2;
            double omega_max = 2 * max / robot.length;
            double omega = lerp(-omega_max, omega_max, theta_k);

            // calculate new parameters
            double R;
            if (omega > 0) {
                R = (2 * max - omega * robot.length) / (2 * omega);
            } else {
                R = (2 * max + omega * robot.length) / (2 * omega);
            }
            double[] velocities = robot.velocities(omega, R);
            
            return velocities;
        }
    }
}
