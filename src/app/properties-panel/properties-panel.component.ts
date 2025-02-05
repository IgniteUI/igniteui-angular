import {
    ChangeDetectorRef,
    Component,
    DestroyRef,
    TemplateRef,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
    PropertyChangeService,
    PropertyPanelConfig,
} from './property-change.service';
import {
    IgxButtonGroupComponent,
    IgxButtonDirective,
    IgxInputDirective,
    IgxInputGroupComponent,
    IgxInputGroupModule,
    IgxSliderComponent,
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
        IgxSwitchComponent,
        IgxRadioModule,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxDatePickerComponent,
        IgxTimePickerComponent,
        IgxDateTimeEditorModule
    ]
})

export class PropertiesPanelComponent {
    protected config: PropertyPanelConfig;
    protected customControls: TemplateRef<any>;

    protected form!: FormGroup;
    protected radioAlignment = RadioGroupAlignment.vertical;
    protected propertyChangeService = inject(PropertyChangeService);
    private destroyRef = inject(DestroyRef);
    private cdRef = inject(ChangeDetectorRef);

    constructor() {
        let subscription: any;

        const panelSubscription =
            this.propertyChangeService.panelConfig.subscribe((config) => {
                this.config = config;

                if (this.form) {
                    subscription.unsubscribe();
                }

                this.form = this.createFormGroup(config);
                subscription = this.form.valueChanges.subscribe(
                    this.onFormValueChange.bind(this)
                );
            });

        const customControlsSubscription =
            this.propertyChangeService.customControlsSource.subscribe(
                (template: TemplateRef<any>) => {
                    if (template) {
                        this.customControls = template;
                        this.cdRef.detectChanges();
                    } else {
                        this.customControls = undefined;
                    }
                }
            );

        this.destroyRef.onDestroy(() => {
            panelSubscription.unsubscribe();
            customControlsSubscription.unsubscribe();
        });
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
        return labels.length > 0
            ? labels
            : options.map((option) => option.toString());
    }
}
