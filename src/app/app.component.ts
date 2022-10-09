import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Machine-Learning-with-Angular';
  predictions: any;
  model: any
  video: any;
  canvas: any;
  canvasCtx: any;

  constructor() {}

  ngOnInit(): void {
    this.loadModel();
    this.video = document.getElementById('video') as HTMLVideoElement;
  }

  async loadModel() {
    this.model = await tf.loadLayersModel('/assets/model.json');
    console.log("model", this.model);
  }

  predict() {
    const pred = tf.tidy(() => {
      // let img = tf.browser.fromPixels(this.video);
      // img = img.reshape([1, 28, 28, 1]);
      // img = tf.cast(img, 'float32');

      this.canvas = document.getElementById('c1') as HTMLCanvasElement;
      this.canvasCtx = this.canvas.getContext('2d');

      this.canvasCtx.drawImage(this.video, 0, 0, 1280, 960);
      const frame = this.canvasCtx.getImageData(0, 0, 1280, 960);
      console.log("frame", frame);
      let img = tf.browser.fromPixels(frame);
      img = img.reshape([1, frame.width, frame.height]);
      const output = this.model.predict(img) as any;

      this.predictions = Array.from(output.dataSync());
      console.log("OPRES", this.predictions);
    });

  }

  openCamera() {
    navigator.mediaDevices.getUserMedia({
      video: {width: 1280 ,height: 960},
      audio: false
    }).then(stream => {
      this.video.srcObject = stream;
    })
  }
}
