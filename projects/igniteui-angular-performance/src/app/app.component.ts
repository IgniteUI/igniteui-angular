import { Component } from '@angular/core';
import { GridComponent } from './grid/grid.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [GridComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
