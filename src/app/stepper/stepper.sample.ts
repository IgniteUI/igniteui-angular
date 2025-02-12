import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    DestroyRef,
    Directive,
    ElementRef,
    HostBinding,
    inject,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    FormsModule,
    NgControl,
    ReactiveFormsModule,
    UntypedFormBuilder,
    Validators
} from '@angular/forms';
import {
    IgxButtonDirective,
    IgxInputGroupComponent,
    IgxLabelDirective,
    IgxInputDirective,
    IgxHintDirective,
    IgxIconComponent,
    IgxPrefixDirective,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxSuffixDirective,
    IStepChangedEventArgs,
    IGX_STEPPER_DIRECTIVES,
    IgxStepType,
    IgxStepperTitlePosition,
    IgxStepperOrientation,
    IgxStepperComponent
} from 'igniteui-angular';
import {
    defineComponents,
    IgcStepperComponent,
    IgcButtonComponent,
    IgcInputComponent,
    registerIconFromText,
    IgcActiveStepChangingArgs,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

defineComponents(IgcStepperComponent, IgcButtonComponent, IgcInputComponent);

const icons = [
    {
        name: 'location_on',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="undefined"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    },
    {
        name: 'shopping_cart',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="undefined"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></svg>',
    },
    {
        name: 'attach_money',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="undefined"><path d="M441-120v-86q-53-12-91.5-46T293-348l74-30q15 48 44.5 73t77.5 25q41 0 69.5-18.5T587-356q0-35-22-55.5T463-458q-86-27-118-64.5T313-614q0-65 42-101t86-41v-84h80v84q50 8 82.5 36.5T651-650l-74 32q-12-32-34-48t-60-16q-44 0-67 19.5T393-614q0 33 30 52t104 40q69 20 104.5 63.5T667-358q0 71-42 108t-104 46v84h-80Z"/></svg>',
    },
    {
        name: 'notes',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="undefined"><path d="M120-240v-80h480v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>',
    },
    {
        name: 'receipt_long',
        url: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="undefined"><path d="M240-80q-50 0-85-35t-35-85v-120h120v-560l60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-560H320v440h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h240v80H360Zm0 120v-80h240v80H360Zm320-120q-17 0-28.5-11.5T640-640q0-17 11.5-28.5T680-680q17 0 28.5 11.5T720-640q0 17-11.5 28.5T680-600Zm0 120q-17 0-28.5-11.5T640-520q0-17 11.5-28.5T680-560q17 0 28.5 11.5T720-520q0 17-11.5 28.5T680-480ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm-40 0v-80 80Z"/></svg>',
    },
];

icons.forEach((icon) => {
    registerIconFromText(icon.name, icon.url);
});

/** https://github.com/angular/angular/issues/51239 */
// This is a fix for value synchronisation otherwise only the state is in sync
// note: Don't remove the FormControlSyncDirective from the component imports
@Directive({
    selector: '[formControlName]',
})
export class FormControlSyncDirective implements OnInit {
    private controlDirective = inject(NgControl);
    private destroyRef = inject(DestroyRef);

    public ngOnInit() {
        this.controlDirective?.control.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                this.controlDirective.control.setValue(value, {
                    emitEvent: false,
                });
            });
    }
}

@Component({
    templateUrl: 'stepper.sample.html',
    styleUrls: ['stepper.sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        IgxButtonDirective,
        FormControlSyncDirective,
        IgxInputGroupComponent,
        IgxLabelDirective,
        FormsModule,
        IgxInputDirective,
        ReactiveFormsModule,
        IgxHintDirective,
        IgxIconComponent,
        IgxPrefixDirective,
        IgxSelectComponent,
        IgxSelectItemComponent,
        IgxSuffixDirective,
        NgTemplateOutlet,
        IGX_STEPPER_DIRECTIVES
    ]
})
export class IgxStepperSampleComponent {
    @ViewChild('stepper',{ static: true, read: IgxStepperComponent })
    public angularStepper!: IgxStepperComponent;

    @ViewChild('stepper2', { static: true })
    public webComponentStepper!: ElementRef;

    @HostBinding('class.vertical-stepper')
    public get isVertical() {
        return this.properties?.orientation === 'vertical';
    }

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
        angularEditTemplate: {
            label: 'Editing mode template (Angular)',
            control: {
                type: 'boolean',
                defaultValue: false
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
    };
    public properties: Properties;

    private fb = inject(UntypedFormBuilder);
    private pcs = inject(PropertyChangeService);

    constructor(private destroyRef: DestroyRef) {
        this.pcs.setPanelConfig(this.panelConfig);

        const { unsubscribe } = this.pcs.propertyChanges.subscribe(
            (properties) => {
                this.properties = properties;
            }
        );

        this.destroyRef.onDestroy(() => unsubscribe);
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
        notes: [''],
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
    public onWcStepperChange(
        event: CustomEvent<IgcActiveStepChangingArgs>
    ): void {
        if (this.isSyncing) return;

        const targetIndex = event.detail.newIndex; // IgcActiveStepChangingArgs has `newIndex` property

        if (
            targetIndex == null ||
            targetIndex < 0 ||
            targetIndex >= this.angularStepper.steps.length
        ) {
            console.warn(
                `Invalid step index in Angular Stepper: ${targetIndex}`
            );
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
