import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { IgxButtonDirective } from 'igniteui-angular';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, IgxButtonDirective, RouterLink],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {

}
