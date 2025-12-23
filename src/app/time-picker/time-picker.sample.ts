import { Component, DestroyRef, inject, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import {
    IgxTimePickerComponent,
    DatePart,
    IgxHintDirective,
    IgxButtonDirective,
    IgxPickerActionsDirective,
    IgxPickerToggleComponent,
    IgxPrefixDirective,
    IgxIconComponent,
    IgxPickerClearComponent,
    IgxSuffixDirective,
    IgxLabelDirective,
    IgSizeDirective,
    PickerInteractionMode,
    IgxSwitchComponent
} from 'igniteui-angular';
import {
    PropertyPanelConfig,
    PropertyChangeService,
    Properties,
} from '../properties-panel/property-change.service';

@Component({
    selector: 'app-time-picker-sample',
    styleUrls: ['time-picker.sample.scss'],
    templateUrl: 'time-picker.sample.html',
    imports: [
        IgxTimePickerComponent,
        FormsModule,
        ReactiveFormsModule,
        IgxHintDirective,
        IgxButtonDirective,
        IgxPickerActionsDirective,
        IgxPickerToggleComponent,
        IgxPrefixDirective,
        IgxIconComponent,
        IgxPickerClearComponent,
        IgxSuffixDirective,
        IgxLabelDirective,
        IgSizeDirective,
        IgxSwitchComponent
    ]
})
export class TimePickerSampleComponent implements OnInit {
    @ViewChild('tp', { read: IgxTimePickerComponent, static: true })
    public tp: IgxTimePickerComponent;

    @ViewChild('customControls', { static: true })
    public customControlsTemplate!: TemplateRef<any>;

    public hasSuffix = false;
    public hasPrefix = false;
    public hasLabel = false;
    public hasHint = false;

    public itemsDelta = { hours: 1, minutes: 15, seconds: 20 };
    public spinLoop = true;
    public datePart = DatePart.Hours;

    public date = new Date(2018, 10, 27, 11, 45, 0, 0);
    public min = new Date(2018, 10, 27, 6, 30, 15, 0);
    public max = new Date(2018, 10, 27, 14, 20, 30, 0);
    public date1 = new Date(2018, 10, 27, 11, 45, 0, 0);
    public val = '08:30:00';
    public today = new Date(Date.now());

    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
                defaultValue: 'medium',
            }
        },
        mode: {
            control: {
                type: 'button-group',
                options: [
                    { label: 'dialog', value: PickerInteractionMode.Dialog},
                    { label: 'dropdown', value: PickerInteractionMode.DropDown}
                ],
                defaultValue: 'dropdown'
            }
        },
        type: {
            control: {
                type: 'button-group',
                options: ['box', 'border', 'line'],
                defaultValue: 'box'
            }
        },
        required: {
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
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        value: {
            control: {
                type: 'time'
            }
        },
        placeholder: {
            control: {
                type: 'text',
                defaultValue: 'hh:mm'
            }
        },
        displayFormat: {
            label: 'Display Format',
            control: {
                type: 'text'
            }
        },
        inputFormat: {
            label: 'Input Format',
            control: {
                type: 'text'
            }
        }
    }

    private fb = inject(UntypedFormBuilder);
    private propertyChangeService = inject(PropertyChangeService);
    private destroyRef = inject(DestroyRef);

    public properties: Properties = Object.fromEntries(
        Object.keys(this.panelConfig).map((key) => {
            const control = this.panelConfig[key]?.control;
            return [key, control?.defaultValue];
        })
    ) as Properties;

    // FormControl owns the time picker value
    public reactiveForm = this.fb.group({
        timePicker: [null],
    });

    constructor() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const propertyChange =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                    this.syncFormControlFromProperties();
                }
            );

        this.destroyRef.onDestroy(() => propertyChange.unsubscribe());
    }

    public ngOnInit() {
        this.propertyChangeService.setCustomControls(
            this.customControlsTemplate
        );
    }

    /**
     * Syncs the reactive form control with the properties panel:
     * - programmatic value updates
     * - required validator
     * - disabled state
     *
     * All done in a way that does NOT mark the control dirty/touched.
     */
    private syncFormControlFromProperties(): void {
        const control = this.reactiveForm.get('timePicker');
        if (!control) {
            return;
        }

        // 1) Programmatic value update (from properties.value)
        // This does NOT mark the control dirty/touched.
        if ('value' in this.properties) {
            const newValue = this.properties.value ?? null;
            const currentValue = control.value;

            // Shallow equality check to avoid unnecessary writes
            const sameValue =
                (newValue === currentValue) ||
                (newValue instanceof Date &&
                    currentValue instanceof Date &&
                    newValue.getTime() === currentValue.getTime());

            if (!sameValue) {
                control.setValue(newValue, { emitEvent: false });
            }
        }

        // 2) Required validator - set without triggering validation
        const currentValidators = control.validator;
        const newValidators = this.properties?.required ? Validators.required : null;

        // Only update validators if they actually changed
        if (currentValidators !== newValidators) {
            control.setValidators(newValidators);
            // Don't call updateValueAndValidity - let natural form lifecycle handle validation
        }

        // 3) Disabled state
        if (this.properties?.disabled) {
            control.disable({ emitEvent: false });
        } else {
            control.enable({ emitEvent: false });
        }
    }    public valueChanged(event) {
        console.log(event);
    }

    public validationFailed(event) {
        console.log(event);
    }

    public showDate(date) {
        return date ? date.toLocaleString() : 'Value is null.';
    }

    public updateValue(event){
        this.val = event;
    }

    public selectCurrentTime(picker: IgxTimePickerComponent) {
        picker.value = new Date(Date.now());
        picker.close();
    }

    public increment() {
        this.tp.increment();
    }
    public decrement() {
        this.tp.decrement(DatePart.Minutes);
    }
}
