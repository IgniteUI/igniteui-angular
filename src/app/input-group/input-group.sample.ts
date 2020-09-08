import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import {
    IgxInputGroupType,
    ButtonGroupAlignment,
    DisplayDensityToken,
    IDisplayDensityOptions,
    IButtonGroupEventArgs,
    IGX_INPUT_GROUP_TYPE
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
    providers: [{provide: IGX_INPUT_GROUP_TYPE, useValue: 'box' }]
})
export class InputGroupSampleComponent implements OnInit, AfterViewInit {
    public inputValue: any;
    public isRequired = false;
    public isDisabled = false;
    public alignment = ButtonGroupAlignment.vertical;
    public density = 'comfortable';
    public displayDensities: Selection[];
    public inputType: IgxInputGroupType = null;
    public inputTypes: Selection[];
    date = new Date();
    constructor(
        @Inject(DisplayDensityToken)
        public displayDensityOptions: IDisplayDensityOptions,
        @Inject(IGX_INPUT_GROUP_TYPE) public TOKEN: IgxInputGroupType
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

    ngAfterViewInit() {
        console.log('The InputGroupToken set for all material themed components(that have no explicit type set on component OR sample lv) is: ',
        this.TOKEN);
    }

    public selectDensity(event: IButtonGroupEventArgs) {
        this.density = this.displayDensities[event.index].label;
    }

    public selectInputType(event: IButtonGroupEventArgs) {
        const currentType = this.inputTypes[event.index].type;
        this.inputType = currentType;
        console.log('New type set is = ', currentType);
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
