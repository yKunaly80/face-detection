import { Component, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-detection',
  standalone: true,
  imports: [],
  templateUrl: './face-detection.component.html',
  styleUrl: './face-detection.component.scss'
})
export class FaceDetectionComponent implements OnInit {

  private _stream!: MediaStream
  private _video!: HTMLVideoElement
  private _canvas!: HTMLCanvasElement
  private _faceDetectTimer!: NodeJS.Timeout

  constructor() {
    this._meadiaSetUp()
  }

  async ngOnInit(): Promise<void> {
    this._video = document.getElementById('localVideo') as HTMLVideoElement;
    this._canvas = document.getElementById('canvasElement') as HTMLCanvasElement;
    await this._loadFaceDetectionModel();
    await this._detectFaces()
  }

  private async _meadiaSetUp(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user', // Use the front camera
          width: { ideal: 1920 }, // 1080p width
          height: { ideal: 1080 }, // 1080p height
        }
      };
      this._stream = await navigator.mediaDevices.getUserMedia(constraints)
      this._video.srcObject = this._stream
    } catch (error) {
      console.log('err==>', error);
    }
  }


  private async _loadFaceDetectionModel(): Promise<void> {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'); // Adjust the path to your models folder
    await faceapi.loadFaceLandmarkModel('/assets/models');
  }


  private async _detectFaces(): Promise<void> {
    this._video.addEventListener('play', async () => {
      faceapi.matchDimensions(this._canvas, { width: this._video.clientWidth, height: this._video.clientHeight });

      this._faceDetectTimer = setInterval(async () => {
        faceapi.matchDimensions(this._canvas, { width: this._video.clientWidth, height: this._video.clientHeight });
        const detections = await faceapi.detectAllFaces(this._video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        const resizedDetections = faceapi.resizeResults(detections, { width: this._video.clientWidth, height: this._video.clientHeight });
        this._drawRectangle(resizedDetections)

      }, 500); // Adjust the interval as needed 
    });
  }

  private _drawRectangle(resizedDetections: Array<any>): void {
    const context = this._canvas.getContext('2d')
    if (context === null) {
      return
    }
    context.clearRect(0, 0, this._canvas.clientWidth, this._canvas.clientHeight);
    resizedDetections.forEach((face: any) => {
      const boundingBox = face.detection.box;
      context.beginPath();
      context.rect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
      context.lineWidth = 2;
      context.strokeStyle = '#1E790F';
      context.stroke();
    });
  }

  ngOnDestroy(): void {
    clearInterval(this._faceDetectTimer)

    this._stream.getTracks().forEach((track) => {
      track.stop()
    })
  }
}
