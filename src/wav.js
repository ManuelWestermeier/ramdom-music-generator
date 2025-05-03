export default function createWavBlobUrl(sampleRate, samples) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = samples.length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV header
    let offset = 0;
    const writeString = (str) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset++, str.charCodeAt(i));
        }
    };

    writeString("RIFF");                     // ChunkID
    view.setUint32(offset, 36 + dataSize, true); offset += 4; // ChunkSize
    writeString("WAVE");                     // Format
    writeString("fmt ");                     // Subchunk1ID
    view.setUint32(offset, 16, true); offset += 4; // Subchunk1Size
    view.setUint16(offset, 1, true); offset += 2;  // AudioFormat (PCM)
    view.setUint16(offset, numChannels, true); offset += 2; // NumChannels
    view.setUint32(offset, sampleRate, true); offset += 4;  // SampleRate
    view.setUint32(offset, byteRate, true); offset += 4;    // ByteRate
    view.setUint16(offset, blockAlign, true); offset += 2;  // BlockAlign
    view.setUint16(offset, bitsPerSample, true); offset += 2; // BitsPerSample
    writeString("data");                     // Subchunk2ID
    view.setUint32(offset, dataSize, true); offset += 4;    // Subchunk2Size

    // PCM data
    for (let i = 0; i < samples.length; i++, offset += 2) {
        // Convert float [-1, 1] to 16-bit signed integer
        let s = Math.max(-1, Math.min(1, samples[i] || 0));
        view.setInt16(offset, s * 0x7FFF, true);
    }

    // Create Blob and Object URL
    const blob = new Blob([buffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
}
