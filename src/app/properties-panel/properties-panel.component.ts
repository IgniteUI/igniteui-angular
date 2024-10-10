import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
    IgxButtonGroupComponent,
    IgxButtonDirective,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxInputGroupModule,
    IgxSliderComponent,
    IgxTickLabelTemplateDirective,
    IgxSwitchComponent,
    IgxRadioModule,
    RadioGroupAlignment,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxDatePickerComponent,
    IgxTimePickerComponent,
    IgxDateTimeEditorModule
} from 'igniteui-angular';

export type ControlType =
    'boolean' |
    'number' |
    'range' |
    'radio' |
    'radio-inline' |
    'button-group' |
    'select' |
    'text' |
    'date' |
    'time' |
    'date-time';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PropertyPanelConfig = {
    [key: string]: {
        label?: string;
        control: {
            type: ControlType,
            options?: string[];
            labels?: string[];
            min?: number;
            max?: number;
            step?: number;
            defaultValue?: any;
        };
    };
}

@Component({
    selector: 'app-properties-panel',
    standalone: true,
    templateUrl: './properties-panel.component.html',
    styleUrl: './properties-panel.component.scss',
    imports: [
        ReactiveFormsModule,
        CommonModule,
        IgxButtonDirective,
        IgxButtonGroupComponent,
        IgxInputDirective,
        IgxInputGroupComponent,
        IgxInputGroupModule,
        IgxSliderComponent,
        IgxTickLabelTemplateDirective,
        IgxSwitchComponent,
        IgxRadioModule,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxDatePickerComponent,
        IgxTimePickerComponent,
        IgxDateTimeEditorModule
    ]
})

export class PropertiesPanelComponent implements OnInit {
    @Input() public config!: PropertyPanelConfig;
    @Output() public propertyChanged: EventEmitter<{ key: string; value: any }> = new EventEmitter<{ key: string; value: any }>();

    protected form!: FormGroup;
    protected radioAlignment = RadioGroupAlignment.vertical;

    public ngOnInit(): void {
        this.form = this.createFormGroup(this.config);
        this.emitInitialValues();
        this.form.valueChanges.subscribe(this.onFormValueChange.bind(this));
    }

    protected onFormValueChange(value: any): void {
        Object.keys(value).forEach(key => {
            const controlConfig = this.config[key]?.control;

            if (controlConfig?.type === 'number') {
                const maxValue = controlConfig.max;
                const minValue = controlConfig.min;
                let controlValue = parseFloat(value[key]);

                // Check if value exceeds min or max limits
                if (maxValue !== undefined && controlValue > maxValue) {
                    controlValue = maxValue;
                }
                if (minValue !== undefined && controlValue < minValue) {
                    controlValue = minValue;
                }

                // Only update form control if value changes
                if (this.form.controls[key].value !== controlValue) {
                    this.form.controls[key].setValue(controlValue, { emitEvent: false });
                }

                this.propertyChanged.emit({ key, value: controlValue });
            } else {
                this.propertyChanged.emit({ key, value: value[key] });
            }
        });
    }

    protected emitInitialValues(): void {
        Object.keys(this.config).forEach(key => {
            const defaultValue = this.config[key]?.control?.defaultValue;
            if (defaultValue !== undefined && defaultValue !== null) {
                this.propertyChanged.emit({ key, value: defaultValue });
                this.form.controls[key].setValue(defaultValue);
            }
        });
    }

    protected createFormGroup(config: PropertyPanelConfig): FormGroup {
        const group: Record<string, FormControl> = {};
        Object.keys(config).forEach(key => {
            const defaultValue = config[key]?.control?.defaultValue ?? '';
            group[key] = new FormControl(defaultValue);
        });
        return new FormGroup(group);
    }

    protected getControlType(key: string): string {
        return this.config[key].control.type;
    }

    protected getControlOptions(key: string): any {
        return this.config[key].control.options;
    }

    protected getControlLabels(key: string): string[] {
        const labels = this.config[key].control.labels || [];
        const options = this.getControlOptions(key);
        return labels.length > 0 ? labels : options.map(option => option.toString());
    }

    protected getConfigKeys(): string[] {
        return Object.keys(this.config);
    }
}


// This is the event handler that you should use in the parent class

// public propertyChanges: { [key: string]: any } = {};

// public onPropertyChange(propertyChange: { key: string; value: any }): void {
//     console.log('Property Changed:', propertyChange);
//     this.propertyChanges[propertyChange.key] = propertyChange.value;
// }

// And use this in the template of the component

// <app-properties-panel
//   [config]="panelConfig"
//   (propertyChanged)="onPropertyChange($event)">
// </app-properties-panel>
