// Calculate Root Mean Squared of block (Linear)
export function calcRmsLin(buffer) {
    let rms = 0
    for (let bufferIndex = 0; bufferIndex < buffer.length; bufferIndex++) {
        rms += buffer[bufferIndex] * buffer[bufferIndex]
    }
    rms /= buffer.length
    rms = Math.sqrt(rms)
    return rms
}
// Calculate Root Mean Squared of block Decibels
export function calcRmsDb(buffer) {
    return 20 * Math.log10(calcRmsLin(buffer))
}
