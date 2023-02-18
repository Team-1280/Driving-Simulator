const addVec = (vec1, vec2) => {
    if (vec1.length != vec2.length) {
        throw new Error("Incompatible vector lengths")
    }
    let out = []
    for (let i = 0; i < vec1.length; i++) {
        out.push(vec1[i] + vec2[i])
    }
    return out
}

const multiplyMatrix = (matrix, vec) => {
    // multiply a column vector by a square matrix
    // matrix should have dimension lengths equal to the length of the vector
    // matrix should be organized with rows first, then columns
    let out = []
    for (let i = 0; i < matrix.length; i++) {
        let sum = 0
        const row = matrix[i]

        for (let j = 0; j < row.length; j++) {
            const el = row[j]
            sum += el * vec[j]
        }

        out.push(sum)
    }
    
    return out
}
