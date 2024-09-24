import { Component, ViewEncapsulation } from '@angular/core';
import { IgxButtonDirective, IgxButtonGroupComponent, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective } from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';
import { defineComponents, IgcButtonComponent, IgcIconButtonComponent} from "igniteui-webcomponents";

defineComponents(IgcButtonComponent, IgcIconButtonComponent);

@Component({
    selector: 'app-button-showcase-sample',
    styleUrls: ['button-showcase.sample.scss'],
    templateUrl: 'button-showcase.sample.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [IgxButtonDirective, IgxIconComponent, IgxButtonGroupComponent, IgxIconButtonDirective, IgxRippleDirective, SizeSelectorComponent]
})
export class ButtonShowcaseSampleComponent {}
