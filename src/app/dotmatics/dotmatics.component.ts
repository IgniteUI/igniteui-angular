import {Component} from '@angular/core';
import {IgxButtonModule, IgxIconComponent, IgxSwitchComponent} from "igniteui-angular";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-dotmatics',
    standalone: true,
    imports: [
        IgxButtonModule,
        IgxIconComponent,
        IgxSwitchComponent,
        FormsModule,
    ],
    templateUrl: './dotmatics.component.html',
    styleUrl: './dotmatics.component.scss'
})
export class DotmaticsComponent {
    public isDisabled = false;
}
