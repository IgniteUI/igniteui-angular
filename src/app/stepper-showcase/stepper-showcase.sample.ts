import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    FormsModule, NgControl,
    ReactiveFormsModule,
    UntypedFormBuilder,
    Validators
} from '@angular/forms';
import {
    IgxButtonDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxInputDirective,
    IgxStepComponent,
    IgxStepTitleDirective,
    IgxStepSubtitleDirective,
    IgxStepContentDirective,
    IgxStepperComponent,
    IgxStepperOrientation,
    IgxStepperTitlePosition,
    IgxStepType,
    IgxHintDirective,
    IgxIconComponent,
    IgxPrefixDirective,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxStepActiveIndicatorDirective,
    IgxStepIndicatorDirective,
    IgxSuffixDirective,
    IgxTimePickerComponent, IStepChangedEventArgs
} from 'igniteui-angular';
import {
    defineComponents,
    IgcStepperComponent,
    IgcButtonComponent,
    IgcInputComponent,
} from 'igniteui-webcomponents';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';
import {JsonPipe, NgTemplateOutlet} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

defineComponents(IgcStepperComponent, IgcButtonComponent, IgcInputComponent);

/** https://github.com/angular/angular/issues/51239 */
// This is a fix for value synchronisation otherwise only the state is in sync
// note: Don't remove the FormControlSyncDirective from the component imports
@Directive({
    selector: "[formControlName]"
})
export class FormControlSyncDirective implements OnInit {
    private controlDirective = inject(NgControl);
    private destroyRef = inject(DestroyRef);
    public ngOnInit() {
        this.controlDirective?.control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
            this.controlDirective.control.setValue(value, { emitEvent: false });
        });
    }
}

@Component({
    templateUrl: 'stepper-showcase.sample.html',
    styleUrls: ['stepper-showcase.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxButtonDirective, FormControlSyncDirective, IgxInputGroupComponent, IgxLabelDirective, FormsModule, IgxInputDirective, IgxStepperComponent, IgxStepComponent, IgxStepTitleDirective, IgxStepSubtitleDirective, IgxStepContentDirective, ReactiveFormsModule, IgxHintDirective, IgxIconComponent, IgxPrefixDirective, IgxSelectComponent, IgxSelectItemComponent, IgxStepActiveIndicatorDirective, IgxStepIndicatorDirective, IgxSuffixDirective, IgxTimePickerComponent, NgTemplateOutlet, JsonPipe]
})
export class IgxStepperShowcaseSampleComponent {
    @ViewChild('stepper', {static: true}) public angularStepper!: IgxStepperComponent;
    @ViewChild('stepper2', { static: true }) public webComponentStepper!: ElementRef;

    private isSyncing = false;
    public panelConfig: PropertyPanelConfig = {
        orientation: {
            control: {
                type: 'button-group',
                options: ['horizontal', 'vertical'],
                defaultValue: 'horizontal'
            }
        },
        titlePosition: {
            label: 'Title Position',
            control: {
                type: 'select',
                options: ['bottom', 'top', 'start', 'end'],
                defaultValue: 'bottom'
            }
        },
        stepType: {
            label: 'Step Type',
            control: {
                type: 'button-group',
                options: ['indicator', 'title', 'full'],
                defaultValue: 'full'
            }
        },
        linear: {
            label: 'Linear mode',
            control: {
                type: 'boolean',
                defaultValue: true
            }
        },
        contentTop: {
            label: 'Place Content on Top',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        verticalAnimation: {
            label: 'Vertical Animation Type',
            control: {
                type: 'button-group',
                options: ['grow', 'fade', 'none'],
                defaultValue: 'grow'
            }
        },
        horizontalAnimation: {
            label: 'Horizontal Animation Type',
            control: {
                type: 'button-group',
                options: ['slide', 'fade', 'none'],
                defaultValue: 'slide'
            }
        },
        animationDuration: {
            label: 'Animation Duration',
            control: {
                type: 'number',
                defaultValue: 320
            }
        },
    }
    public properties: Properties;

    private fb = inject(UntypedFormBuilder);
    private pcs = inject(PropertyChangeService);

    constructor() {
        this.pcs.setPanelConfig(this.panelConfig);
        this.pcs.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    // Reactive forms initialization
    public shoppingCard = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
    });

    public deliveryAddress = this.fb.group({
        address: ['', Validators.required],
    });

    public userDetails = this.fb.group({
        phone: ['', Validators.required],
    });

    public paymentMethod = this.fb.group({
        payment: ['', Validators.required],
    });

    public additionalNotes = this.fb.group({
        notes: ['', Validators.required],
    });

    public finish = this.fb.group({
        email: ['', Validators.required],
    });

    protected get stepType(): IgxStepType {
        const stepTypeValue = this.pcs.getProperty('stepType');
        switch (stepTypeValue) {
            case 'indicator':
                return IgxStepType.Indicator;
            case 'title':
                return IgxStepType.Title;
            case 'full':
                return IgxStepType.Full;
        }
    }

    protected get titlePosition(): IgxStepperTitlePosition {
        const titlePositionValue = this.pcs.getProperty('titlePosition');
        switch (titlePositionValue) {
            case 'bottom':
                return IgxStepperTitlePosition.Bottom;
            case 'top':
                return IgxStepperTitlePosition.Top;
            case 'start':
                return IgxStepperTitlePosition.Start;
            case 'end':
                return IgxStepperTitlePosition.End;
        }
    }

    protected get orientation(): IgxStepperOrientation {
        const orientationValue = this.pcs.getProperty('orientation');
        return orientationValue === 'horizontal'
            ? IgxStepperOrientation.Horizontal
            : IgxStepperOrientation.Vertical;
    }

    // Handle changes from Angular Stepper
    // TODO SEE WHY WEB C ANIMATION IS TRIGGERED AFTER THE ANGULAR
    public onAngularStepperChange(event: IStepChangedEventArgs): void {
        if (this.isSyncing) return;

        const wcStepper = this.webComponentStepper.nativeElement as any;

        // Ensure steps array is initialized
        if (!wcStepper.steps || wcStepper.steps.length === 0) {
            console.warn('Web Component steps are not initialized.');
            this.isSyncing = false;
            return;
        }

        const currentIndex = wcStepper.active; // Current active step in Web Component
        const targetIndex = event.index; // Target step from Angular Stepper

        if (currentIndex === targetIndex) {
            console.log('Angular and Web Component steppers are already synchronized.');
            return;
        }

        this.isSyncing = true;

        const targetStep = wcStepper.steps[targetIndex];

        // Simulate a user click to trigger the Web Component animation
        if (targetStep?.header) {
            targetStep.header.click();
        } else {
            console.warn(`Invalid step index in Web Component: ${targetIndex}`);
        }

        this.isSyncing = false;
    }

    // Handle changes from Web Component Stepper
    public onWcStepperChange(event: CustomEvent<{ owner: any; oldIndex: number; newIndex: number }>): void {
        if (this.isSyncing) return;

        const targetIndex = event.detail?.newIndex;

        if (targetIndex == null || targetIndex < 0 || targetIndex >= this.angularStepper.steps.length) {
            console.warn(`Invalid step index in Angular Stepper: ${targetIndex}`);
            return;
        }

        this.isSyncing = true;

        if (this.angularStepper.steps[targetIndex]?.active !== true) {
            this.angularStepper.navigateTo(targetIndex);
        }

        this.isSyncing = false;
    }

    public steppersPrev(): void {
        this.angularStepper.prev();
        this.webComponentStepper.nativeElement.prev();
    }

    public steppersNext(): void {
        // Navigate Angular Stepper
        this.angularStepper.next();
        this.webComponentStepper.nativeElement.next();
    }
}

