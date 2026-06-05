import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CapturedImage } from '../../core/types';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [DatePipe],
  template: `
    <main class="page">
      <section class="page-header">
        <div>
          <p class="eyebrow">Gallery</p>
          <h1>{{ auth.canViewAllImages() ? 'All captured images' : 'My captured images' }}</h1>
          <p class="muted">Images are stored in Cloudinary with metadata retained in MongoDB.</p>
        </div>
        <button class="button secondary" type="button" (click)="loadImages()">Refresh</button>
      </section>

      @if (error()) {
        <div class="alert error">{{ error() }}</div>
      }

      <section class="gallery">
        @for (image of images(); track image.id) {
          <article class="card">
            <img [src]="image.url" [alt]="'Captured by ' + image.ownerName">
            <div class="card-body">
              <h3>{{ image.ownerName }}</h3>
              <p class="muted">
                <span class="badge">{{ image.ownerRole }}</span>
                {{ image.createdAt | date:'medium' }}
              </p>
            </div>
          </article>
        } @empty {
          <div class="panel">
            <h2>No images yet</h2>
            <p class="muted">Captured images will appear here after upload.</p>
          </div>
        }
      </section>
    </main>
  `
})
export class GalleryComponent implements OnInit {
  protected readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);
  protected readonly images = signal<CapturedImage[]>([]);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.error.set('');
    const request = this.auth.canViewAllImages()
      ? this.api.getAllImages()
      : this.api.getMyImages();

    request.subscribe({
      next: ({ images }) => this.images.set(images),
      error: (err) => this.error.set(err.error?.message || 'Unable to load images.')
    });
  }
}
