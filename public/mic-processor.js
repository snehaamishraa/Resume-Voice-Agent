// Runs on the browser's audio thread.
// Takes mic audio at the device's own sample rate (usually 44.1 or 48 kHz),
// converts it to 16 kHz 16-bit PCM (the format Gemini expects), and sends ~100 ms chunks to the page.
class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000; // `sampleRate` is the AudioContext's rate (a global here)
    this.buffer = new Int16Array(1600); // 1600 samples at 16 kHz = 100 ms
    this.length = 0;
    this.position = 0;
    this.sum = 0;
    this.count = 0;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;

    for (let i = 0; i < channel.length; i++) {
      // Average the input samples that make up one 16 kHz sample (downsample + smooth)
      this.sum += channel[i];
      this.count++;
      this.position++;

      if (this.position >= this.ratio) {
        this.position -= this.ratio;
        const sample = Math.max(-1, Math.min(1, this.sum / this.count));
        this.sum = 0;
        this.count = 0;

        this.buffer[this.length++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        if (this.length === this.buffer.length) {
          this.port.postMessage(this.buffer.buffer.slice(0));
          this.length = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("mic-processor", MicProcessor);
