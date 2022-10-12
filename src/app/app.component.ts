import { Component, OnInit } from '@angular/core';
import { AiService } from './services/ai/ai.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Machine-Learning-with-Angular';
  predictions: any;
  video: any;
  canvas: any;
  isCameraOpen: boolean = false;
  mask_on: any = 0;
  mask_off: any = 0;
  imageData: any;
  ctx: any;

  constructor( private aiService: AiService) { }

  ngOnInit(): void {
    this.video = document.getElementById('video') as HTMLVideoElement;
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.canvas.width = this.video.width;
    this.canvas.height = this.video.height;

    this.ctx = this.canvas.getContext('2d');
  }

  async openCamera() {
    const constsr = {
      video: {
        width: 1280,
        height: 960,
        // deviceId: {
        //   exact: "35f6c3f81e60e4fa441614592552d301bfb3af11fa9fa9641215f1bc0b199ff5"
        // }
        deviceId: {
          exact: "96296925830bfca612a414e031a61bbaa8aa37ac84c54141eca9a635bcf83d6a"
        }
      },
      audio: false,
    }
    await navigator.mediaDevices.getUserMedia(constsr).then(stream => {
      this.video.srcObject = stream;
      this.animate();
    });

  }

  async checkCameraSource() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
  }
  
  // dispose the modal
  dispose() {
    this.aiService.dispose();
  }

  // don't ever add some delay, pause or any related to time
  // this already run at Frame Per Second so dont use any "loop"
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    // ctx.fillRect(100, 100, 10, 10);
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    // get the pixel data from the full canvas
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    // console.log("image data", this.imageData);
    
    // run the async predict function and set the values to our state
    this.aiService.predict(this.imageData).then( (res) => {
      let confidences = JSON.stringify(res);
      let JSONconfidences = JSON.parse(confidences);
      this.mask_on = JSONconfidences.Confidences['mask on'];
      this.mask_off = JSONconfidences.Confidences['mask off'];
      
    }).catch( (err) => {
      console.log("Error on Predict", err)
    });
  }

  // load the modal
  async load() {
    await this.aiService.load();
  }
}
