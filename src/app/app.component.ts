import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
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
  isCameraOpen = new Subject();
  mask_on: any = 0;
  mask_off: any = 0;
  imageData: any;
  ctx: any;
  constructor( private aiService: AiService) { }

  ngOnInit(): void {
    // this.loadModel();
    this.video = document.getElementById('video') as HTMLVideoElement;
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;

    this.ctx = this.canvas.getContext('2d');

    this.animate();


    this.isCameraOpen.subscribe({
      next: (res) => {
        setTimeout( () => {
          // run the async predict function and set the values to our state
          this.aiService.predict(this.imageData).then( (res) => {
            console.log("Results", res);
            let confidences = JSON.stringify(res);
            let parss = JSON.parse(confidences);
            this.mask_on = parss.Confidences['mask on']
            this.mask_off = parss.Confidences['mask off']
            if (this.mask_on > this.mask_off) {
              console.log("mask on");
            }
            if (this.mask_on < this.mask_off) {
              console.log("mask off");
            }
            
          }).catch( (err) => {
            console.log("Error on Predict", err)
          });
        }, 2000);
      },
      error: (err) => {
        console.log("error", err);
      }
    });
  }

  openCamera() {
    const constsr = {
      video: {
        width: 1280,
        height: 960,
        deviceId: {
          exact: "35f6c3f81e60e4fa441614592552d301bfb3af11fa9fa9641215f1bc0b199ff5"
        }
      },
      audio: false,
    }
    navigator.mediaDevices.getUserMedia(constsr).then(stream => {
      this.video.srcObject = stream;
    })
    this.isCameraOpen.next(true);
  }

  async checkCameraSource() {

    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
  }
  
  dispose() {
    this.aiService.dispose();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    console.log("3434343")
    // ctx.fillRect(100, 100, 10, 10);
    this.ctx.drawImage(this.video, 0, 0);
    // get the pixel data from the full canvas
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    // console.log("image data", this.imageData);
  }
}
