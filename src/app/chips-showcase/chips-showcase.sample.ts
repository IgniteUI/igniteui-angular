import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { PropertyPanelConfig } from '../properties-panel/properties-panel.component';
import { PropertyChangeService } from '../properties-panel/property-change.service';

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
export class ChipsShowcaseSampleComponent implements OnInit {
    @ViewChild('customControls', { static: true }) public customControlsTemplate!: TemplateRef<any>;

    public panelConfig : PropertyPanelConfig = {
        variant: {
            control: {
                type: 'select',
                options: ['default', 'primary', 'info', 'success', 'warning', 'danger']
            }
        },
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
                defaultValue: 'large'
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        selectable: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        selected: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        removable: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
    }

    constructor(protected propertyChangeService: PropertyChangeService){}

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
        this.propertyChangeService.setCustomControls(this.customControlsTemplate)
    }

    protected get variant() {
        return this.propertyChangeService.getProperty('variant');
    }

    protected get size() {
        return this.propertyChangeService.getProperty('size');
    }

    protected get disabled() {
        return this.propertyChangeService.getProperty('disabled');
    }

    protected get removable() {
        return this.propertyChangeService.getProperty('removable');
    }

    protected get selectable() {
        return this.propertyChangeService.getProperty('selectable');
    }

    protected get selected() {
        return this.propertyChangeService.getProperty('selected');
    }

    public hasSuffix = false;
    public hasPrefix = false;
    public hasAvatar = false;
    public hasProgressbar = false;
    public customIcons = false;

    public removeChip(chip: IgxChipComponent) {
        chip.nativeElement.remove();
    }

    public onChipsSelected(event: IChipsAreaSelectEventArgs) {
        console.log(event);
    }
}
