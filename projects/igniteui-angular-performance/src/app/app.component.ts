import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Routes } from '@angular/router';
import { IgxButtonDirective } from 'igniteui-angular';
import { routes } from './app.routes';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, IgxButtonDirective, RouterLink],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    protected routes: Routes = routes;
}
