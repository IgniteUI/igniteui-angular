import { Component, Inject, OnInit } from '@angular/core';
import {
    IgxInputGroupType,
    ButtonGroupAlignment,
    DisplayDensityToken,
    IDisplayDensityOptions,
    IButtonGroupEventArgs,
} from 'igniteui-angular';

interface Selection {
    selected: boolean;
    type?: IgxInputGroupType;
    label: string;
    togglable: boolean;
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-input-group-sample',
    styleUrls: ['input-group.sample.scss'],
    templateUrl: 'input-group.sample.html',
})
export class InputGroupSampleComponent implements OnInit {
    public inputValue: any;
    public isRequired = false;
    public isDisabled = false;
    public alignment = ButtonGroupAlignment.vertical;
    public density = 'comfortable';
    public displayDensities: Selection[];
    public inputType: IgxInputGroupType = 'line';
    public inputTypes: Selection[];
    public inputSearchType = 'search';
    date = new Date();
    constructor(
        @Inject(DisplayDensityToken)
        public displayDensityOptions: IDisplayDensityOptions
    ) {}

    public ngOnInit(): void {
        this.displayDensities = [
            {
                label: 'comfortable',
                selected: this.density === 'comfortable',
                togglable: true,
            },
            {
                label: 'cosy',
                selected: this.density === 'cosy',
                togglable: true,
            },
            {
                label: 'compact',
                selected: this.density === 'compact',
                togglable: true,
            },
        ];

        this.inputTypes = [
            { selected: true, type: 'line', label: 'Line', togglable: true },
            {
                selected: this.inputType === 'border',
                type: 'border',
                label: 'Border',
                togglable: true,
            },
            {
                selected: this.inputType === 'box',
                type: 'box',
                label: 'Box',
                togglable: true,
            },
        ];
    }

    public selectDensity(event: IButtonGroupEventArgs) {
        this.density = this.displayDensities[event.index].label;
    }

    public selectInputType(event: IButtonGroupEventArgs) {
        const currentType = this.inputTypes[event.index].type;
        this.inputType = currentType;
    }

    public disableFields() {
        if (this.isDisabled === false) {
            this.isDisabled = true;
        } else if (this.isDisabled === true) {
            this.isDisabled = false;
        }
    }

    public toggleRequired() {
        this.isRequired = !this.isRequired;
    }
}
