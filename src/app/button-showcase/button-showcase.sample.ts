import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { IgxButtonDirective, IgxButtonGroupComponent, IgxIconButtonDirective, IgxIconComponent, IgxIconService, IgxRippleDirective } from 'igniteui-angular';
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
