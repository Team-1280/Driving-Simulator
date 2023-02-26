package Differential;

public class Matrix {
    public static double[] addVec(double[] vec1, double[] vec2) {
        if (vec1.length != vec2.length) {
            throw new Error("Incompatible vector lengths");
        }
        double[] out = new double[vec1.length];
        for (int i = 0; i < vec1.length; i++) {
            out[i] = vec1[i] + vec2[i];
        }
        return out;
    }

    public static double[] multiply(double[][] matrix, double[] vec) {
        // multiply a column vector by a square matrix
        // matrix should have dimension lengths equal to the length of the vector
        // matrix should be organized with rows first, then columns
        double[] out = new double[vec.length];
        for (int i = 0; i < matrix.length; i++) {
            double sum = 0;
            double[] row = matrix[i];

            for (int j = 0; j < row.length; j++) {
                double el = row[j];
                sum += el * vec[j];
            }

            out[i] = sum;
        }

        return out;
    }
}
