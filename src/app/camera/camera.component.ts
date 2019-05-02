import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import DetectRTC from 'detectrtc';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss', './camera.scss']
})
export class CameraComponent implements OnInit {

  @ViewChild('stream') videoRef: ElementRef;
  @ViewChild('snapshot') canvasRef: ElementRef;
  @Output() capture = new EventEmitter();
  @Input() overlaySize: string;

  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;

  viewingSnapshot: boolean = false;
  overlay = {
    width: '',
    height: '',
    left: '',
    top: ''
  }
  isLandscapeMode: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  public initCamera(): void {
    DetectRTC.load(() => {
      // Check if camera feature is supported
      if (DetectRTC.isWebRTCSupported == false) {
        alert('Please use Chrome, Firefox, iOS 11, Android 5 or higher, Safari 11 or higher');
      } else {
        if (DetectRTC.hasWebcam == false) {
          alert('Please install an external webcam device.');
        } else {
          console.log('Overlay SIZE: '+this.overlaySize);
          this.initCameraUI();
          this.clearSnapshot();
          this.initCameraStream();
        }
      }
      console.log("RTC Debug info: " + 
        "\n OS:                   " + DetectRTC.osName + " " + DetectRTC.osVersion + 
        "\n browser:              " + DetectRTC.browser.fullVersion + " " + DetectRTC.browser.name +
        "\n is Mobile Device:     " + DetectRTC.isMobileDevice +
        "\n has webcam:           " + DetectRTC.hasWebcam + 
        "\n has permission:       " + DetectRTC.isWebsiteHasWebcamPermission +       
        "\n getUserMedia Support: " + DetectRTC.isGetUserMediaSupported + 
        "\n isWebRTC Supported:   " + DetectRTC.isWebRTCSupported + 
        "\n WebAudio Supported:   " + DetectRTC.isAudioContextSupported +
        "\n is Mobile Device:     " + DetectRTC.isMobileDevice+
        "\n Total amount of Cameras:     " + DetectRTC.videoInputDevices.length
      );
    });
  }

  updateOverLaySize(){
    if(window.orientation === 90 || window.orientation === -90){
      //load landscape values
      this.overlay = this.getOverlaySizeLandscape(this.overlaySize);
      this.isLandscapeMode = true;
    }else{
      this.overlay = this.getOverlaySize(this.overlaySize);
      this.isLandscapeMode = false;
    }
  }

  initCameraUI(): void {
    this.video = this.videoRef.nativeElement;
    this.canvas = this.canvasRef.nativeElement;
    this.updateOverLaySize();
    window.addEventListener("orientationchange", () => {
      this.updateOverLaySize();
    }, false);
  }

  getOverlaySize(type: string) {
    
    const size = {
      M: {
        width: 70,
        height: 28,
        left: 14,
        top: 26
      },
      L: {
        width: 78,
        height: 32,
        left: 10,
        top: 24
      }
    };
    return size[type];
  }

  getOverlaySizeLandscape(type: string) {
    
    const size = {
      M: {
        width: 44,
        height: 64,
        left: 18,
        top: 16
      },
      L: {
        width: 52,
        height: 80,
        left: 14,
        top: 9
      }
    };
    return size[type];
  }

  initCameraStream() {
    // Stop any active streams in the window
    if (window['stream']) {
      window['stream'].getTracks().forEach(track => {
        track.stop();
      });
    }

    let constraints = {
      audio: false,
      video: {
        width: { ideal: 3840 },
        height: { ideal: 2160 },
        facingMode: 'environment'
        /* facingMode: { exact: 'environment' } */
      }
    };

    console.log('video 1920')

    const handleSuccess = (stream) => {
      window['stream'] = stream; // Make stream available to browser console
      this.video.srcObject = stream;
      let track = stream.getVideoTracks()[0];
      console.log(track)
      track.applyConstraints({
        advanced: [
          { focusMode: 'auto' }
        ]
      })
      return navigator.mediaDevices.enumerateDevices();
    }

    const handleError = (error) => {
      console.log('ERROR: '+error);
      if (error === 'PermissionDeniedError') {
        alert("Permission denied. Please refresh and give permission.");
      }
    }

    navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
  }

  takeSnapshot(): void {
    console.log('VIDEO WIDTH: '+this.video.videoWidth+' VIDEO HEIGHT: '+this.video.videoHeight);

    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);

    this.viewingSnapshot = true;
  }

  retakeSnapshot(): void {
    this.clearSnapshot();
    this.viewingSnapshot = false;
  }

  clearSnapshot(): void {
    this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.viewingSnapshot = false;
  }

  stopVideo(): void {
    if (window['stream']) {
      window['stream'].getTracks().forEach(track => {
        track.stop();
      });
    }
  }

  confirmSnapshot(): void{
    let canvasResult: HTMLCanvasElement = document.createElement('canvas');

    let sizeType = this.isLandscapeMode ? this.getOverlaySizeLandscape(this.overlaySize) : this.getOverlaySize(this.overlaySize);
    console.log(sizeType)
    sizeType.top = sizeType.top + 1;
    sizeType.left = sizeType.left + 1;

    console.log('adjust1');

    for( let key in sizeType ) {
      if( sizeType.hasOwnProperty(key) ) {
        sizeType[key] = sizeType[key]/100;
      }
    }
    console.log(sizeType)

    const width = this.video.videoWidth*sizeType.width;
    const height = this.video.videoHeight*sizeType.height;

    console.log('width: '+width+' height: '+height);

    canvasResult.width = width;
    canvasResult.height = height;

    const left = this.video.videoWidth*sizeType.left;
    const top = this.video.videoHeight*sizeType.top;

    console.log('LEFT: '+left+' TOP: '+top);

    let imageData = this.canvas.getContext("2d").getImageData(left, top, width, height);

    let ctx = canvasResult.getContext("2d");
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.putImageData(imageData, 0, 0);

    this.stopVideo();

    const getCanvasBlob = (canvas: HTMLCanvasElement) => {
      return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      })
    };

    getCanvasBlob(canvasResult).then((blob: Blob) => {
      console.log('Size: '+blob.size/Math.pow(1024,2)+' mb');
      let blobResult = {
        os: DetectRTC.osName + " " + DetectRTC.osVersion,
        size: blob.size/Math.pow(1024,2)+' mb',
        browser: DetectRTC.browser.fullVersion + " " + DetectRTC.browser.name,
        resolution: DetectRTC.displayResolution,
        ratio: DetectRTC.displayAspectRatio,
        data: ''
      }
      // do something with the image blob
      let reader = new FileReader();
      reader.onload = () => {
        console.log('Blob in Base64: '+reader.result);
        blobResult.data = reader.result;
        this.capture.emit(blobResult);
      };
      reader.readAsDataURL(blob); // converts the blob to base64 and calls onload
    });
  }

}