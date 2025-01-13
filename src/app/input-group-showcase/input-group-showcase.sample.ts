import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal, computed, viewChild, DestroyRef} from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators} from '@angular/forms';
import {
    defineComponents,
    IgcInputComponent,
    IgcIconComponent,
    IgcSelectGroupComponent,
    IgcSelectComponent,
    IgcSelectItemComponent,
    IgcSelectHeaderComponent,
} from 'igniteui-webcomponents';
import {
    IGX_INPUT_GROUP_DIRECTIVES,
    IGX_INPUT_GROUP_TYPE,
    IgxIconComponent,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxInputGroupComponent,
    IgxComboComponent,
} from 'igniteui-angular';
import {PropertyPanelConfig, PropertyChangeService, Properties} from '../properties-panel/property-change.service';

// Define Ignite UI Web Components
defineComponents(
    IgcInputComponent,
    IgcIconComponent,
    IgcSelectGroupComponent,
    IgcSelectComponent,
    IgcSelectItemComponent,
    IgcSelectHeaderComponent
);

@Component({
    selector: 'app-input-group-showcase-sample',
    styleUrls: ['input-group-showcase.sample.scss'],
    templateUrl: 'input-group-showcase.sample.html',
    providers: [{provide: IGX_INPUT_GROUP_TYPE, useValue: 'box'}], // Default input group type
    imports: [
        FormsModule,
        ReactiveFormsModule,
        IGX_INPUT_GROUP_DIRECTIVES,
        IgxIconComponent,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxComboComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InputGroupShowcaseSampleComponent {
    public field = viewChild<IgxInputGroupComponent>('field');
    public fieldTextarea = viewChild<IgxInputGroupComponent>('fieldTextarea');
    public fieldFile = viewChild<IgxInputGroupComponent>('fieldFile');
    public select = viewChild<IgxSelectComponent>('selectReactive');

    private fb = inject(UntypedFormBuilder);
    private pcs = inject(PropertyChangeService);

    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
                defaultValue: 'medium'
            }
        },
        inputType: {
            label: 'Input Group Type',
            control: {
                type: 'button-group',
                options: ['box', 'border', 'line', 'search'],
                defaultValue: ''
            }
        },
        type: {
            label: 'Native Input Type',
            control: {
                type: 'select',
                options: ['email', 'number', 'password', 'search', 'tel', 'text', 'url'],
                defaultValue: 'text'
            }
        },
        label: {
            control: {
                type: 'text',
                defaultValue: 'Web address'
            }
        },
        value: {
            control: {
                type: 'text',
                defaultValue: ''
            }
        },
        placeholder: {
            control: {
                type: 'text',
                defaultValue:
                    'Placeholder'
            }
        },
        required: {
            label: 'Required',
            control: {
                type: 'boolean', defaultValue: false
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        readonly: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hidePrefix: {
            label: 'Hide Prefix',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideSuffix: {
            label: 'Hide Suffix',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
    };

    // Reactive properties for managing UI states
    public properties = signal<Properties>(
        Object.fromEntries(
            Object.keys(this.panelConfig).map((key) => {
                const control = this.panelConfig[key]?.control;
                return [key, control?.defaultValue];
            })
        ) as Properties
    );

    // Reactive form initialization
    public reactiveForm = this.fb.group({
        angularSelect: [this.properties()?.value || ''],
        angularCombo: [this.properties()?.value || ''],
        field: [this.properties()?.value || ''],
        fieldTextarea: [this.properties()?.value || ''],
        fieldFile: [this.properties()?.value || '']
    });

    constructor(private destroyRef: DestroyRef) {
        this.pcs.setPanelConfig(this.panelConfig);

        const { unsubscribe } = this.pcs.propertyChanges.subscribe((updatedProperties) => {
            const mergedProperties = this.mergeProperties(updatedProperties);

            this.properties.set(mergedProperties);
            this.updateFormControls();
            this.getPlaceholder();
        });

        this.destroyRef.onDestroy(() => unsubscribe);
    }

    // Merge incoming property updates with the default configuration
    private mergeProperties(updatedProperties: any): Properties {
        return Object.fromEntries(
            Object.entries(this.panelConfig).map(([key, config]) => [
                key,
                updatedProperties[key] !== undefined
                    ? updatedProperties[key]
                    : config?.control?.defaultValue
            ])
        ) as Properties;
    }

    // Update reactive form controls dynamically
    private updateFormControls(): void {
        const patchValues = {
            angularSelect: this.properties()?.value || '',
            angularCombo: this.properties()?.value || '',
            field: this.properties()?.value || '',
            fieldTextarea: this.properties()?.value || '',
        };

        this.reactiveForm.patchValue(patchValues);

        this.updateDisabledState(this.properties().disabled);
        this.updateValidators(this.properties().required);
    }

    // Enable or disable form controls based on `disabled` property
    private updateDisabledState(isDisabled: boolean): void {
        Object.keys(this.reactiveForm.controls).forEach((controlName) => {
            const control = this.reactiveForm.get(controlName);
            if (control) {
                isDisabled ? control.disable() : control.enable();
            }
        });
    }

    // Set validators for form controls dynamically
    private updateValidators(isRequired: boolean): void {
        Object.keys(this.reactiveForm.controls).forEach((controlName) => {
            const control = this.reactiveForm.get(controlName);
            if (control) {
                control.setValidators(isRequired ? Validators.required : null);
                control.updateValueAndValidity();
            }
        });
    }

    public getValue = computed(() => this.properties()?.value || '');
    public getSize = computed(() => `var(--ig-size-${this.properties()?.size || 'medium'})`);
    public getPlaceholder = computed(() => this.properties()?.placeholder || null);
    public getLabel = computed(() => this.properties()?.label || '');
    public getNativeInputType = computed(() => this.properties()?.type || 'text');
    public getInputGroupType = computed(() => this.properties()?.inputType || '');

    public isOutlined = computed((): boolean => this.properties()?.inputType === 'border');
    public isRequired = computed(() => !!this.properties()?.required);
    public isDisabled = computed(() => !!this.properties()?.disabled);
    public isReadonly = computed(() => !!this.properties()?.readonly);
    public hidePrefix = computed(() => !!this.properties()?.hidePrefix);
    public hideSuffix = computed(() => !!this.properties()?.hideSuffix);
}

