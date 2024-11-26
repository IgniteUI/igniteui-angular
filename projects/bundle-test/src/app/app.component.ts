import { Component } from '@angular/core';
import { ChipResourceStringsBG } from 'igniteui-angular-i18n';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterOutlet]
})
export class AppComponent {
    protected chipStrings = ChipResourceStringsBG;
}
