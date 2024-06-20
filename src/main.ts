import './style.css';

class App {
  private GRAYSCALE = 'Ñ@#WM$9876543210?!abc:+=-,^._        ' as const;
  private RESOLUTION = {
    VIDEO: { width: 640, height: 480 },
    CANVAS: { width: 64, height: 48 },
  } as const;
  private ELEMENTS = {
    video: document.getElementById('video') as HTMLVideoElement,
    canvas: document.createElement('canvas') as HTMLCanvasElement,
    asciiImage: document.getElementById('ascii-image') as HTMLDivElement,
    captureButton: document.getElementById('capture-button') as HTMLButtonElement,
    startButton: document.getElementById('start-button') as HTMLButtonElement,
  } as const;

  private animationId = -1;

  constructor() {
    this.init();
  }

  async init() {
    const { video, canvas, asciiImage, captureButton, startButton } = this.ELEMENTS;
    video.width = this.RESOLUTION.VIDEO.width;
    video.height = this.RESOLUTION.VIDEO.height;
    try {
      video.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    } catch (e) {
      console.error(e);
    }

    canvas.width = this.RESOLUTION.CANVAS.width;
    canvas.height = this.RESOLUTION.CANVAS.height;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    startButton.addEventListener('click', async () => {
      try {
        await video.play();
        this.startAnimation();
        captureButton.style.display = 'block';
        startButton.style.display = 'none';
      } catch (e) {
        console.error('Failed to play video:', e);
      }
    });

    captureButton.addEventListener('click', () => {
      if (this.animationId === -1) return this.startAnimation();
      this.stopAnimation();

      const asciiImageString = asciiImage.innerText;
      navigator.clipboard.writeText(asciiImageString);
    });
  }

  startAnimation() {
    this.animationId = window.requestAnimationFrame(() => this.draw());
  }
  stopAnimation() {
    window.cancelAnimationFrame(this.animationId);
    this.animationId = -1;
  }

  draw() {
    this.animationId = window.requestAnimationFrame(() => this.draw());

    const { video, canvas, asciiImage } = this.ELEMENTS;
    const width = this.RESOLUTION.CANVAS.width;
    const height = this.RESOLUTION.CANVAS.height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(video, 0, 0, video.width, video.height, 0, 0, width, height);

    const { data } = ctx.getImageData(0, 0, width, height);
    let asciiImageString = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const avg = (r + g + b) / 3;
        const charIndex = Math.floor((avg / 255) * this.GRAYSCALE.length);
        const c = this.GRAYSCALE.charAt(charIndex);

        asciiImageString += c;
      }
      asciiImageString += '\n';
    }
    asciiImage.innerHTML = asciiImageString;
  }
}

new App();
