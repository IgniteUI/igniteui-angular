import { AnimationBuilder } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    AfterViewInit, Component, HostBinding, OnDestroy, OnInit,
    Input, Output, EventEmitter, ContentChildren, QueryList, ElementRef, NgModule, ViewChild
} from '@angular/core';
import { IgxCarouselComponentBase } from 'igniteui-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { growVerIn, growVerOut } from '../animations/grow';
import { slideInLeft, slideOutRight } from '../animations/slide';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxStepperOrienatation, IGX_STEPPER_COMPONENT, IStepToggledEventArgs, IStepTogglingEventArgs } from './common';
import {
    IgxStepIconDirective, IgxStepInvalidIconDirective,
    IgxStepLabelDirective, IgxStepValidIconDirective
} from './igx-stepper.directive';
import { IgxStepComponent } from './step/igx-step.component';
import { IgxStepperService } from './stepper.service';


// TO DO: common interface between IgxCarouselComponentBase and ToggleAnimationPlayer?


@Component({
    selector: 'igx-stepper',
    templateUrl: 'igx-stepper.component.html',
    styleUrls: ['igx-stepper.component.scss'],
    providers: [
        IgxStepperService,
        { provide: IGX_STEPPER_COMPONENT, useExisting: IgxStepperComponent },
    ]
})
export class IgxStepperComponent extends IgxCarouselComponentBase implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('horizontalContentContainer') public horizontalContentContainer: ElementRef;

    @HostBinding('class.igx-stepper')
    public cssClass = 'igx-stepper';

    /** Get/Set the animation settings that branches should use when expanding/collpasing.
     *
     * ```html
     * <igx-tree [animationSettings]="customAnimationSettings">
     * </igx-tree>
     * ```
     *
     * ```typescript
     * const animationSettings: ToggleAnimationSettings = {
     *      openAnimation: growVerIn,
     *      closeAnimation: growVerOut
     * };
     *
     * this.tree.animationSettings = animationSettings;
     * ```
     */
    @Input()
    public animationSettings: ToggleAnimationSettings = {
        openAnimation: growVerIn,
        closeAnimation: growVerOut
    };

    /**
     * Get/Set whether the stepper is linear.
     * Only if the active step is valid the user is able to move forward.
     *
     * ```html
     * <igx-stepper [linear]="true"></igx-stepper>
     * ```
     */
    @Input()
    public linear = false;

    /**
     * Get/Set the stepper orientation.
     *
     * ```typescript
     * this.stepper.orientation = IgxStepperOrienatation.Vertical;
     * ```
     */
    @Input()
    public get orientation(): IgxStepperOrienatation | string {
        return this._orientation;
    }

    public set orientation(value: IgxStepperOrienatation | string) {
        if (this._orientation === value) {
            return;
        }
        if (value === IgxStepperOrienatation.Horizontal) {
            this.animationSettings = {
                openAnimation: slideInLeft,
                closeAnimation: slideOutRight
            };
        } else {
            this.animationSettings = {
                openAnimation: growVerIn,
                closeAnimation: growVerOut
            };
        }
        this._orientation = value;
    }

    @Output()
    public activeStepChanging = new EventEmitter<IStepTogglingEventArgs>();

    @Output()
    public activeStepChanged = new EventEmitter<IStepToggledEventArgs>();

    /** @hidden @internal */
    @ContentChildren(IgxStepComponent, { descendants: false })
    private _steps: QueryList<IgxStepComponent>;

    // /** @hidden @internal */
    // public disabledChange = new EventEmitter<IgxStepComponent>();

    private destroy$ = new Subject<void>();
    private unsubChildren$ = new Subject<void>();
    private _orientation: IgxStepperOrienatation | string = IgxStepperOrienatation.Vertical;

    constructor(
        builder: AnimationBuilder,
        public stepperService: IgxStepperService,
        private element: ElementRef<HTMLElement>) {
        super(builder);
        this.stepperService.register(this);
        // this.navService.register(this);
    }

    public get steps(): IgxStepComponent[] {
        return this._steps.toArray();
    }

    /** @hidden @internal */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /** @hidden @internal */
    public handleKeydown(event: KeyboardEvent) {
        // this.navService.handleKeydown(event);
    }

    /** @hidden @internal */
    public ngOnInit() {
        this.enterAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.activeStepChanged.emit({ owner: this, activeStep: this.stepperService.activeStep });
        });
        this.leaveAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.stepperService.collapse(this.stepperService.previousActiveStep);
            this.stepperService.previousActiveStep.cdr.markForCheck();
        });
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        this._steps.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.subToChanges();
        });
        // this.scrollNodeIntoView(this.navService.activeNode?.header?.nativeElement);
        this.subToChanges();
    }

    /** @hidden @internal */
    public ngOnDestroy() {
        this.unsubChildren$.next();
        this.unsubChildren$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }

    public dummy() {
        this.previousItem = this.stepperService.previousActiveStep;
        this.currentItem = this.stepperService.activeStep;
        this.triggerAnimations();
    }

    protected getPreviousElement(): HTMLElement {
        return this.stepperService.previousActiveStep?.horizontalContentContainer.nativeElement;
    }

    protected getCurrentElement(): HTMLElement {
        return this.stepperService.activeStep.horizontalContentContainer.nativeElement;
    }

    private subToChanges() {
        this.unsubChildren$.next();
        this.steps.forEach(step => {
            step.horizontalContentContainer = this.horizontalContentContainer;
            // step.closeAnimationDone.pipe(takeUntil(this.unsubChildren$)).subscribe(() => {
            //     const targetElement = this.navService.focusedNode?.header.nativeElement;
            //     this.scrollNodeIntoView(targetElement);
            // });
            // step.openAnimationDone.pipe(takeUntil(this.unsubChildren$)).subscribe(() => {
            //     const targetElement = this.navService.focusedNode?.header.nativeElement;
            //     this.scrollNodeIntoView(targetElement);
            // });
        });
        // this.navService.init_invisible_cache();
    }

    private scrollNodeIntoView(el: HTMLElement) {
        if (!el) {
            return;
        }
        const nodeRect = el.getBoundingClientRect();
        const treeRect = this.nativeElement.getBoundingClientRect();
        const topOffset = treeRect.top > nodeRect.top ? nodeRect.top - treeRect.top : 0;
        const bottomOffset = treeRect.bottom < nodeRect.bottom ? nodeRect.bottom - treeRect.bottom : 0;
        const shouldScroll = !!topOffset || !!bottomOffset;
        if (shouldScroll && this.nativeElement.scrollHeight > this.nativeElement.clientHeight) {
            // this.nativeElement.scrollTop = nodeRect.y - treeRect.y - nodeRect.height;
            this.nativeElement.scrollTop =
                this.nativeElement.scrollTop + bottomOffset + topOffset + (topOffset ? -1 : +1) * nodeRect.height;
        }
    }
}

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        IgxStepComponent,
        IgxStepperComponent,
        IgxStepLabelDirective,
        IgxStepIconDirective,
        IgxStepValidIconDirective,
        IgxStepInvalidIconDirective,
    ],
    exports: [
        IgxStepComponent,
        IgxStepperComponent,
        IgxStepLabelDirective,
        IgxStepIconDirective,
        IgxStepValidIconDirective,
        IgxStepInvalidIconDirective,
    ]
})
export class IgxStepperModule { }
