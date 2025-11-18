import { Component, DestroyRef, inject, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import {
    IgxTimePickerComponent,
    IgxInputDirective,
    AutoPositionStrategy,
    OverlaySettings,
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

    @ViewChild('target')
    public target: IgxInputDirective;

    @ViewChild('customControls', { static: true })
    public customControlsTemplate!: TemplateRef<any>;

    public hasSuffix = false;
    public hasPrefix = false;
    public hasLabel = false;
    public hasHint = false;

    public itemsDelta = { hours: 1, minutes: 15, seconds: 20 };
    public format = 'hh:mm:ss:SS a';
    public spinLoop = true;
    public datePart = DatePart.Hours;

    public date = new Date(2018, 10, 27, 11, 45, 0, 0);
    public min = new Date(2018, 10, 27, 6, 30, 15, 0);
    public max = new Date(2018, 10, 27, 14, 20, 30, 0);
    public date1 = new Date(2018, 10, 27, 11, 45, 0, 0);
    public val = '08:30:00';
    public today = new Date(Date.now());

    public isRequired = true;

    public myOverlaySettings: OverlaySettings = {
        modal: false,
        closeOnOutsideClick: true,
        positionStrategy: new AutoPositionStrategy()
    };

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

    public reactiveForm = this.fb.group({
        timePicker: [this.properties?.value || ''],
    });

    constructor() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const propertyChange =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                    this.reactiveForm.patchValue({
                        timePicker: properties?.value || ''
                    });
                    this.updateRequiredValidator();
                }
            );

        this.destroyRef.onDestroy(() => propertyChange.unsubscribe());
    }

    public ngOnInit() {
        this.propertyChangeService.setCustomControls(
            this.customControlsTemplate
        );
    }

    private updateRequiredValidator(): void {
        const control = this.reactiveForm.get('timePicker');
        if (control) {
            control.setValidators(this.properties?.required ? Validators.required : null);
            control.updateValueAndValidity();
        }
    }

    public change() {
        this.isRequired = !this.isRequired;
    }

    public valueChanged(event) {
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
