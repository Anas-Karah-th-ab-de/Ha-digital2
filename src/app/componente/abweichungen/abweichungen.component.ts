import { Component, Inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CameraService } from '../../service/camera.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-abweichungen',
  templateUrl: './abweichungen.component.html',
  styleUrls: ['./abweichungen.component.css']
})
export class AbweichungenComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  inputText: string = '';
  capturedPhotos: string[] = [];
  isCameraRunning: boolean = false;
  isUploading: boolean = false;
  deletedPhotos: string[] = [];
  usingFrontCamera: boolean = true; // Variable to track which camera is being used

  constructor(
    public dialogRef: MatDialogRef<AbweichungenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cameraService: CameraService,
    private cdr: ChangeDetectorRef
  ) {
    this.dialogRef.disableClose = true; // Verhindert das Schließen des Dialogs durch Klicken außerhalb oder Drücken von ESC
  }
  

  ngAfterViewInit(): void {
    if (this.data.photoPaths) {
      this.loadPhotosFromPaths(this.data.photoPaths);
    }
    if (this.data.text) {
      this.inputText = this.data.text;
    }
    this.cdr.detectChanges();
  }

  async toggleCamera(): Promise<void> {
    if (this.isCameraRunning) {
      this.stopCamera();
    } else {
      await this.startCamera(this.usingFrontCamera);
    }
  }

  async startCamera(useFrontCamera: boolean = true): Promise<void> {
    try {
      if (!this.videoElement || !this.videoElement.nativeElement) {
        console.error('Video element not available.');
        return;
      }

      const video: HTMLVideoElement = this.videoElement.nativeElement;

      // Stop any existing video stream
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }

      // Get the user media with the correct facing mode
      const constraints = {
        video: {
          facingMode: useFrontCamera ? 'user' : 'environment'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      await video.play();
      this.isCameraRunning = true;
      this.cdr.detectChanges(); // Update the view manually
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  }

  async switchCamera(): Promise<void> {
    this.usingFrontCamera = !this.usingFrontCamera;
    if (this.isCameraRunning) {
      await this.startCamera(this.usingFrontCamera);
    }
  }

  capturePhoto(): void {
    if (!this.isCameraRunning) return;
  
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
  
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL('image/png');
      this.capturedPhotos.push(photo);
      this.savePhotoToCache(photo);
      this.stopCamera();
    } else {
      console.error('Error: Unable to get canvas context');
    }
  }
  

  stopCamera(): void {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      const stream: MediaStream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        this.isCameraRunning = false;
        this.cdr.detectChanges(); // Update the view manually
      }
    }
  }

  savePhotoToCache(photo: string): void {
    let cachedPhotos = JSON.parse(localStorage.getItem('capturedPhotos') || '[]');
    cachedPhotos.push(photo);
    localStorage.setItem('capturedPhotos', JSON.stringify(cachedPhotos));
  }

  async loadPhotosFromPaths(photoPaths: string[]): Promise<void> {
    try {
      const response = await lastValueFrom(this.cameraService.getPhotosByPaths(photoPaths.filter(p => p)));
      if (response.photos) {
        this.capturedPhotos = response.photos.map((photo: any) => photo.base64);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  }

  deletePhoto(index: number): void {
    const photoToDelete = this.data.photoPaths[index]; // Use the original path for deletion
    this.cameraService.deletePhoto(photoToDelete).subscribe({
      next: () => {
        this.capturedPhotos.splice(index, 1);
        this.data.photoPaths.splice(index, 1); // Remove from the original paths as well
        this.deletedPhotos.push(photoToDelete); // Track the deleted photo
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error deleting photo:', err)
    });
  }

  async save(): Promise<void> {
    const dialogResult = {
      text: this.inputText,
      photos: [] as string[], // Explicitly define the type of photos array
      componentName: this.data.componentName, // Include the component name in the result
      deletedPhotos: this.deletedPhotos // Include deleted photo paths
    };

    this.isUploading = true;
    for (const photo of this.capturedPhotos) {
      try {
        const response = await lastValueFrom(this.cameraService.uploadPhoto(this.data.orderNumber, photo, this.data.componentName, this.data.row));
        if (!dialogResult.photos.includes(response.path)) { // Ensure no duplicate entries
          dialogResult.photos.push(response.path); // Ensure response.path is a string
          localStorage.removeItem('capturedPhotos');
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        location.reload();
      }
    }
    this.isUploading = false;

    this.dialogRef.close(dialogResult);
  }

  cancel(): void {
    this.stopCamera();
    localStorage.removeItem('capturedPhotos'); // Clear local storage if cancelled
    this.dialogRef.close();
  }
}
