import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IGX_LIST_DIRECTIVES, IgxNavbarComponent } from 'igniteui-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, IgxNavbarComponent, IGX_LIST_DIRECTIVES],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ssr-test';
}
