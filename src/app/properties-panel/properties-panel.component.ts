import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { PropertyChangeService, PropertyPanelConfig } from './property-change.service';
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

    protected form!: FormGroup;
    protected radioAlignment = RadioGroupAlignment.vertical;

    protected propertyChangeService = inject(PropertyChangeService);

    public ngOnInit(): void {
        this.form = this.createFormGroup(this.config);
        this.propertyChangeService.emitInitialValues(this.config);
        this.form.valueChanges.subscribe(this.onFormValueChange.bind(this));
    }

    protected onFormValueChange(value: any): void {
        Object.keys(value).forEach((key) => {
            this.propertyChangeService.updateProperty(key, value[key]);
        });
    }

    protected createFormGroup(config: PropertyPanelConfig): FormGroup {
        const group: Record<string, FormControl> = {};
        Object.keys(config).forEach((key) => {
            const defaultValue = config[key]?.control?.defaultValue ?? '';
            group[key] = new FormControl(defaultValue);
        });
        return new FormGroup(group);
    }

    protected getConfigKeys(): string[] {
        return Object.keys(this.config);
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
}
