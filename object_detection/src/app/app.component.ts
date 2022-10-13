import { Component, OnInit } from '@angular/core';
import { AiService } from './services/ai/ai.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'object_detection';
  video: any;
  canvas: any;
  ctx: any;
  cameras: any = [];
  model: any;
  imageData: any;

  constructor(private aiService: AiService) {}

  ngOnInit(): void {
    this.checkCameraSource();

    this.video = document.getElementById('video') as HTMLVideoElement;
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;

    this.ctx = this.canvas.getContext('2d');

  }

  async checkCameraSource() {
    this.cameras = await navigator.mediaDevices.enumerateDevices();
  }

  async cameraSource(event: any) {
    const selectedCamera = event.target?.value

    const constsr = {
      video: {
        width: 1280,
        height: 960,
        deviceId: {
          exact: selectedCamera
        }
      },
      audio: false,
    }
    await navigator.mediaDevices.getUserMedia(constsr).then(stream => {
      this.video.srcObject = stream;
      this.animate();
    });
  }

  async loadModel() {
    this.model = await this.aiService.loadModel();
    console.log("model", this.model);
  }

  async predict() {
    if (!this.model) {
      await this.loadModel()
    }
    const predictions = await this.aiService.predict(this.model, this.video);
    const [x, y , width, height] = predictions[0].bbox;
    console.log("predictions", x, y, width, height);
  }

  // don't ever add some delay, pause or any related to time
  // this already run at Frame Per Second so dont use any "loop"
  async animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (!this.model) {
      await this.loadModel()
    }
    const predictions = await this.aiService.predict(this.model, this.video);
    if (predictions[0].score > 0.66) {
      const [x, y , width, height] = predictions[0].bbox;
      // console.log("predictions", x, y, width, height);
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "rgba(255,0,0,0.2)";
      this.ctx.fillRect(x, y, width, height);
    }
    // get the pixel data from the full canvas
    // this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    // console.log("image data", this.imageData);
  }
}
