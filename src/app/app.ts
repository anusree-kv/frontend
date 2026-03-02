import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CvComponent } from './cv.component/cv.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CvComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
