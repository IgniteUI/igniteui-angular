import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IgxNavbarComponent } from 'igniteui-angular/navbar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet, IgxNavbarComponent]
})
export class AppComponent {
}
