import { Component, OnInit, ViewChild } from '@angular/core';

import { CameraComponent } from '../camera/camera.component';

@Component({
  selector: 'app-upload-your-document',
  templateUrl: './upload-your-document.component.html',
  styleUrls: ['./upload-your-document.component.scss']
})
export class UploadYourDocumentComponent implements OnInit {

  @ViewChild('appCamera') appCamera: CameraComponent;
  hiddenCamera: boolean = true;

  overlaySize: string = "M";

  stream;

  constructor() { }

  ngOnInit() {
  
  }

  onChangeOverlaySize(value){
    this.overlaySize = value;
  }

  openCamera(): void {
    this.appCamera.initCamera();
    this.hiddenCamera = false;
  }

  loadCaptureStream(stream): void {
    this.hiddenCamera = true;
    this.stream = stream;
  }

}