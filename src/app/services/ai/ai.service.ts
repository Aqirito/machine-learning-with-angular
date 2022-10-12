import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

const LEGACY_VERSION = -1;
const SUPPORTED_VERSIONS = [LEGACY_VERSION, 1];

@Injectable({
  providedIn: 'root'
})
export class AiService {
  canvasCtx: any;
  signature: any = {};
  width: number = 224;
  height: number = 224;
  inputKey = "Image_1";
  outputKey = "Confidences";
  labelKey = "Label";
  labels: string[] = [];
  version?: number;
  model?: tf.LayersModel;
  outputName: string = '';

  constructor() { }

  async load() {
    if (!this.model) {
      console.log("Loading our model...");
      const signatureFile = await fetch("./assets/signature.json");
      this.signature = await signatureFile.json();
      // console.log("signature", this.signature);
      [this.width, this.height] = this.signature.inputs[this.inputKey].shape.slice(1, 3);
      // console.log(`width: ${this.width}, height: ${this.height}`);
      this.outputName = this.signature.outputs[this.outputKey].name;
      // console.log(`Output Name: ${this.outputName}`);
      this.labels = this.signature.classes[this.labelKey];
      // console.log(`Labels: ${this.labels}`);
      this.version = this.signature.export_model_version || LEGACY_VERSION;
      if (!this.version || !SUPPORTED_VERSIONS.includes(this.version)) {
        const versionMessage = `The model version ${this.version} you are using for this starter project may not be compatible with the supported versions ${SUPPORTED_VERSIONS}. Please update both this starter project and Lobe to latest versions, and try exporting your model again. If the issue persists, please contact us at lobesupport@microsoft.com`;
        throw new Error(versionMessage);
      }
      this.model = await tf.loadLayersModel("./assets/model.json");
      console.log("Model loaded!");
    }
  }

  dispose() {
    /* Free up the memory used by the TensorFlow.js GraphModel */
    if (this.model) {
      console.log("Clearing our model.");
      this.model.dispose();
      this.model = undefined;
    }
  }

  async predict(imageData: ImageData) {
    if (!this.model) {
      await this.load();
    }
    const confidencesTensor = tf.tidy(() => {
      // create a tensor from the canvas image data
      const image = tf.browser.fromPixels(imageData);
      
      let imageResize = tf.image.resizeBilinear(image, [224,224])

      // convert image to 0-1
      const normalizedImage = tf.div(imageResize, tf.scalar(255));
      // console.log(`Normelaize Image: ${normalizedImage}`);
      
      // make into a batch of 1 so it is shaped [1, height, width, 3]
      const batchImage: tf.Tensor4D = tf.expandDims(normalizedImage);
      // console.log(`batch Image: ${batchImage}`);

      // run the model on our image and await the results as an array
      if (this.model) {
        return this.model.predict(batchImage, {batchSize: 4});
      }
      return {"something wrong 1": "please check aiService"};
    }) as (tf.Tensor | undefined);
    if (confidencesTensor) {
      // grab the array of values from the tensor data
      const confidencesArray = await confidencesTensor.data();
      // now that we have the array values, we can dispose the tensor and free memory
      confidencesTensor.dispose();
      // return a map of [label]: confidence computed by the model
      // the list of labels maps in the same index order as the outputs from the results

      return {
        [this.outputKey]: this.labels.reduce(
          (returnConfidences, label, idx) => {
            return { [label]: confidencesArray[idx], ...returnConfidences }
          }, {}
        )
      }
    }
    return {"someting wrong 2": "please check aiService"};
  }
}
