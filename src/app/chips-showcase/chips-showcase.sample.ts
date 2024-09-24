import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IgxAvatarComponent,
    IgxButtonGroupComponent,
    IgxChipComponent,
    IgxChipsAreaComponent,
    IgxDropDirective,
    IgxIconComponent,
    IgxPrefixDirective,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxSuffixDirective,
    IgxSwitchComponent,
    IgxCircularProgressBarComponent,
} from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';
import { defineComponents, IgcChipComponent} from "igniteui-webcomponents";

defineComponents(IgcChipComponent);

@Component({
    selector: 'app-chips-showcase-sample',
    styleUrls: ['chips-showcase.sample.scss', '../app.component.scss'],
    templateUrl: 'chips-showcase.sample.html',
    standalone: true,
    imports: [
        IgxButtonGroupComponent,
        IgxChipComponent,
        IgxCircularProgressBarComponent,
        IgxIconComponent,
        IgxPrefixDirective,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxSuffixDirective,
        IgxSwitchComponent,
        IgxChipsAreaComponent,
        NgFor,
        NgIf,
        FormsModule,
        IgxAvatarComponent,
        IgxDropDirective,
        SizeSelectorComponent
    ]
})
export class ChipsShowcaseSampleComponent {
    public chipTypes = ['default', 'primary', 'info', 'success', 'warning', 'danger'];

    public removeChip(chip: IgxChipComponent) {
        chip.nativeElement.remove();
    }
}
