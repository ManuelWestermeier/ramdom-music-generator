import './style.css';
import createWavBlobUrl from "./wav.js";

const sampleRate = 44100;
const freqSlider = document.getElementById("freq-slider");
const freqLabel = document.getElementById("freq-label");
const audio = document.querySelector("audio");
const button = document.getElementById("start-button");

freqSlider.oninput = () => {
  freqLabel.textContent = freqSlider.value;
};

async function hashSample(value) {
  const input = new Uint8Array([Math.floor((value + 1) * 127)]);
  const hashBuffer = await crypto.subtle.digest('SHA-256', input);
  const hashBytes = new Uint8Array(hashBuffer);
  const short = (hashBytes[0] << 8) | hashBytes[1];
  return (short / 0x8000) - 1;
}

async function generateAndPlay(freqValue) {
  const samples = new Float32Array(sampleRate);
  const freq = (i) => Math.sin((2 * Math.PI * freqValue * i) / sampleRate);

  for (let i = 0; i < samples.length; i++) {
    samples[i] = await hashSample(freq(i));
  }

  const wavUrl = createWavBlobUrl(sampleRate, samples);
  audio.src = wavUrl;
  audio.play();
}

button.onclick = () => {
  const freq = parseFloat(freqSlider.value);
  generateAndPlay(freq);
};
