import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-camera',
  standalone: true,
  template: `
    <main class="page">
      <section class="page-header">
        <div>
          <p class="eyebrow">Capture</p>
          <h1>Camera upload</h1>
          <p class="muted">Capture an image from the inbuilt camera and upload it to secure Cloudinary storage.</p>
        </div>
      </section>

      @if (message()) {
        <div class="alert success">{{ message() }}</div>
      }
      @if (error()) {
        <div class="alert error">{{ error() }}</div>
      }

      <section class="panel">
        <div class="camera-frame">
          @if (snapshot()) {
            <img [src]="snapshot()" alt="Captured preview">
          } @else {
            <video #video autoplay muted playsinline></video>
          }
        </div>

        <canvas #canvas hidden></canvas>

        <div class="actions camera-actions">
          <button class="button secondary" type="button" (click)="startCamera()" [disabled]="streamActive()">
            Start camera
          </button>
          <button class="button" type="button" (click)="capture()" [disabled]="!streamActive()">
            Capture
          </button>
          <button class="button secondary" type="button" (click)="retake()" [disabled]="!snapshot()">
            Retake
          </button>
          <button class="button" type="button" (click)="upload()" [disabled]="!snapshot() || uploading()">
            {{ uploading() ? 'Uploading...' : 'Upload image' }}
          </button>
        </div>
      </section>
    </main>
  `
})
export class CameraComponent implements OnDestroy {
  @ViewChild('video') private videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') private canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly api = inject(ApiService);
  private stream?: MediaStream;

  protected readonly snapshot = signal('');
  protected readonly streamActive = signal(false);
  protected readonly uploading = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');

  async startCamera(): Promise<void> {
    this.error.set('');
    this.message.set('');

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      this.streamActive.set(true);
      queueMicrotask(() => {
        const video = this.videoRef?.nativeElement;
        if (video && this.stream) {
          video.srcObject = this.stream;
        }
      });
    } catch {
      this.error.set('Unable to access the camera. Check browser permissions and use HTTPS in production.');
    }
  }

  capture(): void {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas) {
      return;
    }

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.snapshot.set(canvas.toDataURL('image/jpeg', 0.9));
    this.stopCamera();
  }

  retake(): void {
    this.snapshot.set('');
    void this.startCamera();
  }

  upload(): void {
    const imageData = this.snapshot();
    if (!imageData || this.uploading()) {
      return;
    }

    this.uploading.set(true);
    this.error.set('');
    this.message.set('');

    this.api.uploadImage(imageData).subscribe({
      next: () => {
        this.snapshot.set('');
        this.message.set('Image uploaded successfully.');
        this.uploading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to upload image.');
        this.uploading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  private stopCamera(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    this.streamActive.set(false);
  }
}
