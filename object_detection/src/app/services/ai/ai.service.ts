import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  constructor() { }

  loadModel() {
    return cocoSsd.load();
  }

  predict(model: any, image: ImageData) {
    return model.detect(image);
  }
}
