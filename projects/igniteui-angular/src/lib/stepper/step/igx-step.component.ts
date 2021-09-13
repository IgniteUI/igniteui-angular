import { AnimationBuilder } from '@angular/animations';
import {
    AfterViewInit, ChangeDetectorRef, Component, ElementRef,
    EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild
} from '@angular/core';
import { IgxSlideComponentBase } from 'igniteui-angular';
import { takeUntil } from 'rxjs/operators';
import { Direction } from '../../carousel/carousel-base';
import { ToggleAnimationPlayer, ToggleAnimationSettings } from '../../expansion-panel/toggle-animation-component';
import { IgxStepperOrienatation, IgxStepperProgressLine, IGX_STEPPER_COMPONENT, IStepTogglingEventArgs } from '../common';
import { IgxStepperComponent } from '../igx-stepper.component';
import { IgxStepperService } from '../stepper.service';

let NEXT_ID = 0;

@Component({
    selector: 'igx-step',
    templateUrl: 'igx-step.component.html',
    styleUrls: ['igx-step.component.scss']
})
export class IgxStepComponent extends ToggleAnimationPlayer implements OnInit, AfterViewInit, OnDestroy, IgxSlideComponentBase {

    /**
     * Get/Set the `id` of the step component.
     * Default value is `"igx-step-0"`;
     * ```html
     * <igx-step id="my-first-step"></igx-step>
     * ```
     * ```typescript
     * const stepId = this.step.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-step-${NEXT_ID++}`;

    //  /**
    //   * To be used for load-on-demand scenarios in order to specify whether the node is loading data.
    //   *
    //   * @remarks
    //   * Loading nodes do not render children.
    //   */
    //  @Input()
    //  public loading = false;


    /** @hidden @internal */
    public get animationSettings(): ToggleAnimationSettings {
        return this.stepper.animationSettings;
    }

    /**
     * Get the step index inside of the stepper.
     *
     * ```typescript
     * const step = this.stepper.steps[1];
     * const stepIndex: number = step.index;
     * ```
     */
    public get index(): number {
        return this._index;
    }

    /**
     * Get/Set whether the step should be skipped. It could be activated on click.
     *
     * ```html
     * <igx-stepper>
     * ...
     *     <igx-step [skip]="true"></igx-step>
     * ...
     * </igx-stepper>
     * ```
     *
     * ```typescript
     * this.stepper.steps[1].skip = true;
     * ```
     */
    @Input()
    public skip = false;

    /**
     * Get/Set whether the step is interactable.
     *
     * ```html
     * <igx-stepper>
     * ...
     *     <igx-step [disabled]="true"></igx-step>
     * ...
     * </igx-stepper>
     * ```
     *
     * ```typescript
     * this.stepper.steps[1].disabled = true;
     * ```
     */
    @Input()
    @HostBinding('class.igx-step--disabled')
    public disabled = false;

    @Input()
    @HostBinding('class.igx-step--complete')
    public complete = false;

    /**
     * Get/Set whether the step is valid.
     *
     */
    @Input()
    public isValid = true;

    /** @hidden */
    @HostBinding('class.igx-step--invalid')
    public get invalidClass(): boolean {
        return !this.isValid;
    }

    /**
     * Get/Set whether the step the progress indicator type.
     *
     * ```typescript
     * this.stepper.steps[1].completedStyle = IgxStepperProgressLine.Dashed;
     * ```
     */
    @Input()
    public completedStyle = IgxStepperProgressLine.Solid;

    /** @hidden @internal */
    @HostBinding('class.igx-step--solid')
    public get solidClass() {
        return this.complete && this.completedStyle === IgxStepperProgressLine.Solid;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-step--dashed')
    public get dashedClass() {
        return this.complete && this.completedStyle === IgxStepperProgressLine.Dashed;
    }

    /**
     * Get/Set whether the step is optional.
     *
     * ```html
     * <igx-stepper>
     * ...
     *     <igx-step [optional]="true"></igx-step>
     * ...
     * </igx-stepper>
     * ```
     *
     * ```typescript
     * this.stepper.steps[1].optional = true;
     * ```
     */
    @Input()
    public optional = false;

    /**
     * Gets/Sets the active state of the node
     *
     * @param value: boolean
     */
    @Input()
    public set active(value: boolean) {
        if (value) {
            this.stepperService.expandThroughApi(this);
        } else {
            this.stepperService.collapse(this);
        }
    }

    public get active(): boolean {
        return this.stepperService.activeStep === this;
    }

    public get collapsing(): boolean {
        return this.stepperService.collapsingSteps.has(this);
    }

    @Output()
    public activeChange = new EventEmitter<boolean>();

    // /** @hidden @internal */
    // public get focused() {
    //     return this.isFocused &&
    //         this.navService.focusedStep === this;
    // }

    //  // TODO: bind to disabled state when node is dragged
    //  /**
    //   * Gets/Sets the disabled state of the node
    //   *
    //   * @param value: boolean
    //   */
    //  @Input()
    //  @HostBinding('class.igx-tree-node--disabled')
    //  public get disabled(): boolean {
    //      return this._disabled;
    //  }

    //  public set disabled(value: boolean) {
    //      if (value !== this._disabled) {
    //          this._disabled = value;
    //          this.tree.disabledChange.emit(this);
    //      }
    //  }

    /** @hidden @internal */
    @HostBinding('class.igx-step')
    public cssClass = 'igx-step';

    //  // TODO: will be used in Drag and Drop implementation
    //  /** @hidden @internal */
    //  @ViewChild('ghostTemplate', { read: ElementRef })
    //  public header: ElementRef;

    //  @ViewChild('defaultIndicator', { read: TemplateRef, static: true })
    //  private _defaultExpandIndicatorTemplate: TemplateRef<any>;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('contentTemplate',)
    public contentTemplate: TemplateRef<any>;

    @ViewChild('verticalContentContainer', { read: ElementRef })
    public verticalContentContainer: ElementRef;

    public horizontalContentContainer: ElementRef;

    // /** @hidden @internal */
    // public get isCompact(): boolean {
    //     return this.stepper?.displayDensity === DisplayDensity.compact;
    // }

    // /** @hidden @internal */
    // public get isCosy(): boolean {
    //     return this.stepper?.displayDensity === DisplayDensity.cosy;
    // }

    /** @hidden @internal */
    public isFocused: boolean;

    public direction: Direction = Direction.NONE;
    public previous: boolean;


    //  private _disabled = false;
    private _index = NEXT_ID - 1;

    constructor(
        @Inject(IGX_STEPPER_COMPONENT) public stepper: IgxStepperComponent,
        protected stepperService: IgxStepperService,
        public cdr: ChangeDetectorRef,
        protected builder: AnimationBuilder,
        private element: ElementRef<HTMLElement>
    ) {
        super(builder);
    }

    public get isHorizontal() {
        return this.stepper.orientation === IgxStepperOrienatation.Horizontal;
    }

    /**
     * The native DOM element representing the node. Could be null in certain environments.
     *
     * ```typescript
     * // get the nativeElement of the second node
     * const node: IgxTreeNode = this.tree.nodes.first();
     * const nodeElement: HTMLElement = node.nativeElement;
     * ```
     */
    /** @hidden @internal */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /** @hidden @internal */
    public ngOnInit() {
        this.openAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(
            () => {
                this.stepper.activeStepChanged.emit({ owner: this.stepper, activeStep: this });
            }
        );
        this.closeAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.stepperService.collapse(this);
            this.cdr.markForCheck();
        });
    }

    /** @hidden @internal */
    public ngAfterViewInit() { }

    public getStepHeaderClasses() {
        if(this.active) {
            return 'igx-step__header--active';
        }
        if (this.disabled) {
            return 'igx-step__header--disabled';
        }
        if (this.skip) {
            return 'igx-step__header--skip';
        }
    }

    // /**
    //  * @hidden @internal
    //  * Sets the focus to the node's <a> child, if present
    //  * Sets the node as the tree service's focusedNode
    //  * Marks the node as the current active element
    //  */
    // public handleFocus(): void {
    //     //  if (this.disabled) {
    //     //      return;
    //     //  }
    //     if (this.navService.focusedStep !== this) {
    //         this.navService.focusedStep = this;
    //     }
    //     this.isFocused = true;
    // }

    /**
     * @hidden @internal
     * Clear the node's focused status
     */
    public clearFocus(): void {
        this.isFocused = false;
    }

    /**
     * @hidden @internal
     */
    public onPointerDown(event) {
        event.stopPropagation();
        this.stepperService.expand(this);
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
    }

}
