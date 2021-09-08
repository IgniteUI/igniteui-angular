import { AnimationBuilder } from '@angular/animations';
import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChild, ElementRef,
    EventEmitter, HostBinding, Inject, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { DisplayDensity } from '../../core/displayDensity';
import { ToggleAnimationPlayer, ToggleAnimationSettings } from '../../expansion-panel/toggle-animation-component';
import { IgxStepperOrienatation, IGX_STEPPER_COMPONENT, IStepTogglingEventArgs } from '../common';
import { IgxStepperComponent } from '../igx-stepper.component';
import { IgxStepContentDirective } from '../igx-stepper.directive';
import { IgxStepperService } from '../stepper.service';

let NEXT_ID = 0;

@Component({
    selector: 'igx-step',
    templateUrl: 'igx-step.component.html',
    styleUrls: ['igx-step.component.scss']
})
export class IgxStepComponent extends ToggleAnimationPlayer implements OnInit, AfterViewInit, OnDestroy {

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
     * Gets/Sets the active state of the node
     *
     * @param value: boolean
     */
    @Input()
    public set active(value: boolean) {
        if (value) {
            this.stepperService.expand(this, false);
        } else {
            this.stepperService.collapse(this);
        }
    }

    public get active(): boolean {
        return this.stepperService.activeStep === this;
    }


    /**
     * Emitted when the node's `expanded` property changes.
     *
     * ```html
     * <igx-tree>
     *      <igx-tree-node *ngFor="let node of data" [data]="node" [(expanded)]="node.expanded">
     *      </igx-tree-node>
     * </igx-tree>
     * ```
     *
     * ```typescript
     * const node: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * node.expandedChange.pipe(takeUntil(this.destroy$)).subscribe((e: boolean) => console.log("Node expansion state changed to ", e))
     * ```
     */
    @Output()
    public expandedChange = new EventEmitter<boolean>();

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
    @ContentChild(IgxStepContentDirective)
    public contentDirective: IgxStepContentDirective;

    public get contentTemplate() {
        return this.contentDirective.templateRef;
    }

    @ViewChild('verticalContent', { read: ElementRef })
    public contentContainer: ElementRef;

    /** @hidden @internal */
    public get isCompact(): boolean {
        return this.stepper?.displayDensity === DisplayDensity.compact;
    }

    /** @hidden @internal */
    public get isCosy(): boolean {
        return this.stepper?.displayDensity === DisplayDensity.cosy;
    }

    /** @hidden @internal */
    public isFocused: boolean;

    public horizontalContainer: ElementRef;

    //  private _disabled = false;
    private _index = NEXT_ID - 1;

    constructor(
        @Inject(IGX_STEPPER_COMPONENT) public stepper: IgxStepperComponent,
        protected stepperService: IgxStepperService,
        protected cdr: ChangeDetectorRef,
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
                this.stepper.stepExpanded.emit({ owner: this.stepper, activeStep: this });
            }
        );
        this.closeAnimationDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.stepper.stepCollapsed.emit({ owner: this.stepper, activeStep: this });
            this.stepperService.collapse(this);
            this.cdr.markForCheck();
        });
    }

    /** @hidden @internal */
    public ngAfterViewInit() { }

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
        if (this.stepperService.activeStep === this) {
            return;
        }
        // this.navService.focusedStep = this;
        this.expand();
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
    }

    /**
     * Expands the node, triggering animation
     *
     * ```html
     * <igx-tree>
     *      <igx-tree-node #node>My Node</igx-tree-node>
     * </igx-tree>
     * <button igxButton (click)="node.expand()">Expand Node</button>
     * ```
     *
     * ```typescript
     * const myNode: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * myNode.expand();
     * ```
     */
    public expand() {
        const args: IStepTogglingEventArgs = {
            owner: this.stepper,
            activeStep: this,
            previousActiveStep: this.stepperService.previousActiveStep,
            cancel: false

        };
        this.stepper.stepExpanding.emit(args);
        if (!args.cancel) {
            this.stepperService.expand(this, true);
            this.cdr.detectChanges();
            if (!this.isHorizontal) {
                this.playOpenAnimation(
                    this.contentContainer
                );
            } else {
                this.playOpenAnimation(
                    this.horizontalContainer
                );
            }

        }
    }

    /**
     * Collapses the node, triggering animation
     *
     * ```html
     * <igx-tree>
     *      <igx-tree-node #node>My Node</igx-tree-node>
     * </igx-tree>
     * <button igxButton (click)="node.collapse()">Collapse Node</button>
     * ```
     *
     * ```typescript
     * const myNode: IgxTreeNode<any> = this.tree.findNodes(data[0])[0];
     * myNode.collapse();
     * ```
     */
    public collapse() {
        const args: IStepTogglingEventArgs = {
            owner: this.stepper,
            activeStep: this,
            previousActiveStep: this.stepperService.previousActiveStep,
            cancel: false

        };
        this.stepper.stepCollapsing.emit(args);
        if (!args.cancel) {
            this.stepperService.collapsing(this);
            if (!this.isHorizontal) {
                this.playCloseAnimation(
                    this.contentContainer
                );
            } else {
                this.playCloseAnimation(
                    this.horizontalContainer
                );
            }
        }
    }

    public get collapsing() {
        return this.stepperService.collapsingSteps.has(this);
    }
}
