import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IChipsAreaSelectEventArgs,
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
import { defineComponents, IgcChipComponent, IgcAvatarComponent, IgcButtonComponent, IgcIconButtonComponent, IgcCircularProgressComponent} from "igniteui-webcomponents";

defineComponents(IgcChipComponent, IgcAvatarComponent, IgcButtonComponent, IgcIconButtonComponent, IgcCircularProgressComponent);

@Component({
    selector: 'app-chips-showcase-sample',
    styleUrls: ['chips-showcase.sample.scss', '../app.component.scss'],
    templateUrl: 'chips-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

    public isDisabled = false;

    public isRemovable = false;

    public isSelectable = false;

    public hasSuffix = false;

    public hasPrefix = false;

    public hasAvatar = false;

    public hasProgressbar = false;

    public customIcons = false;

    public isDraggable = false;

    public selected: string;

    public isSelected = false;

    public size: string = 'large';

    public removeChip(chip: IgxChipComponent) {
        chip.nativeElement.remove();
    }

    public onChipsSelected(event: IChipsAreaSelectEventArgs) {
        console.log(event);
    }
}
