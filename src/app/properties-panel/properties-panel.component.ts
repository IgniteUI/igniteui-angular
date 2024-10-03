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

export interface PropertyPanelConfig {
    [key: string]: {
        label?: string;
        control: {
            type: 'boolean' | 'number' | 'range' | 'radio' | 'radio-inline' | 'button-group' | 'select' | 'text' | 'date' | 'time' | 'date-time',
            options?: any[];
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

    public form!: FormGroup;
    public alignment = RadioGroupAlignment.vertical;

    public ngOnInit(): void {
        this.form = this.createFormGroup(this.config);
        this.emitInitialValues();
        this.form.valueChanges.subscribe(this.onFormValueChange.bind(this));
    }

    private onFormValueChange(value: any): void {
        Object.keys(value).forEach(key => {
            this.propertyChanged.emit({ key, value: value[key] });
        });
    }

    private emitInitialValues(): void {
        Object.keys(this.config).forEach(key => {
            const defaultValue = this.config[key]?.control?.defaultValue;
            if (defaultValue !== undefined) {
                this.propertyChanged.emit({ key, value: defaultValue });
                this.form.controls[key].setValue(defaultValue);
            }
        });
    }

    private createFormGroup(config: PropertyPanelConfig): FormGroup {
        const group: Record<string, FormControl> = {};
        Object.keys(config).forEach(key => {
            const defaultValue = config[key]?.control?.defaultValue ?? '';
            group[key] = new FormControl(defaultValue);
        });
        return new FormGroup(group);
    }

    // Public method to retrieve the control type for the template
    public getControlType(key: string): string {
        return this.config[key].control.type;
    }

    // Public method to retrieve options for specific controls
    public getOptions(key: string): any {
        return this.config[key].control.options;
    }

    // Retrieve the labels for a given control (if any)
    public getLabels(key: string): string[] {
        const labels = this.config[key].control.labels || [];
        const options = this.getOptions(key);
        return labels.length > 0 ? labels : options.map(option => option.toString());
    }

    // Retrieve the keys of the config to iterate over in the template
    public getConfigKeys(): string[] {
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
