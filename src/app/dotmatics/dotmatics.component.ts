import {Component} from '@angular/core';
import {
    IgxButtonModule,
    IgxIconComponent, IgxInputDirective,
    IgxInputGroupComponent,
    IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective,
    IgxSwitchComponent
} from "igniteui-angular";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-dotmatics',
    standalone: true,
    imports: [
        IgxButtonModule,
        IgxIconComponent,
        IgxSwitchComponent,
        FormsModule,
        IgxInputGroupComponent,
        IgxLabelDirective,
        IgxInputDirective,
        IgxPrefixDirective,
        IgxSuffixDirective,
    ],
    templateUrl: './dotmatics.component.html',
    styleUrl: './dotmatics.component.scss'
})
export class DotmaticsComponent {
    public isButtonDisabled = false;
    public isInputDisabled = false;
}
