import { Component, OnInit } from '@angular/core';

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
    });
  }
}
