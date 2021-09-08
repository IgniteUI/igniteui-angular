import { CommonModule } from '@angular/common';
import {
    AfterViewInit, Component, HostBinding, OnDestroy, OnInit,
    Input, Output, EventEmitter, ContentChildren, QueryList, ElementRef, Optional, Inject, NgModule, ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { growVerIn, growVerOut } from '../animations/grow';
import { slideInLeft, slideInRight, slideOutLeft, slideOutRight } from '../animations/slide';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/displayDensity';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxStepperOrienatation, IGX_STEPPER_COMPONENT, IStepToggledEventArgs, IStepTogglingEventArgs } from './common';
import {
    IgxStepContentDirective,
    IgxStepIconDirective, IgxStepInvalidIconDirective,
    IgxStepLabelDirective, IgxStepValidIconDirective
} from './igx-stepper.directive';
import { IgxStepComponent } from './step/igx-step.component';
import { IgxStepperService } from './stepper.service';


@Component({
    selector: 'igx-stepper',
    templateUrl: 'igx-stepper.component.html',
    styleUrls: ['igx-stepper.component.scss'],
    providers: [
        IgxStepperService,
        { provide: IGX_STEPPER_COMPONENT, useExisting: IgxStepperComponent },
    ]
})
export class IgxStepperComponent extends DisplayDensityBase implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('contentTemplate') public contentTemplate: ElementRef;

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

    /** Emitted when a node is expanding, before it finishes
     *
     * ```html
     * <igx-tree (nodeExpanding)="handleNodeExpanding($event)">
     * </igx-tree>
     * ```
     *
     *```typescript
     * public handleNodeExpanding(event: ITreeNodeTogglingEventArgs) {
     *  const expandedNode: IgxTreeNode<any> = event.node;
     *  if (expandedNode.disabled) {
     *      event.cancel = true;
     *  }
     * }
     *```
     */
    @Output()
    public stepExpanding = new EventEmitter<IStepTogglingEventArgs>();

    /** Emitted when a node is expanded, after it finishes
     *
     * ```html
     * <igx-tree (nodeExpanded)="handleNodeExpanded($event)">
     * </igx-tree>
     * ```
     *
     *```typescript
     * public handleNodeExpanded(event: ITreeNodeToggledEventArgs) {
     *  const expandedNode: IgxTreeNode<any> = event.node;
     *  console.log("Node is expanded: ", expandedNode.data);
     * }
     *```
     */
    @Output()
    public stepExpanded = new EventEmitter<IStepToggledEventArgs>();

    /** Emitted when a node is collapsing, before it finishes
     *
     * ```html
     * <igx-tree (nodeCollapsing)="handleNodeCollapsing($event)">
     * </igx-tree>
     * ```
     *
     *```typescript
     * public handleNodeCollapsing(event: ITreeNodeTogglingEventArgs) {
     *  const collapsedNode: IgxTreeNode<any> = event.node;
     *  if (collapsedNode.alwaysOpen) {
     *      event.cancel = true;
     *  }
     * }
     *```
     */
    @Output()
    public stepCollapsing = new EventEmitter<IStepTogglingEventArgs>();

    /** Emitted when a node is collapsed, after it finishes
     *
     * @example
     * ```html
     * <igx-tree (nodeCollapsed)="handleNodeCollapsed($event)">
     * </igx-tree>
     * ```
     * ```typescript
     * public handleNodeCollapsed(event: ITreeNodeToggledEventArgs) {
     *  const collapsedNode: IgxTreeNode<any> = event.node;
     *  console.log("Node is collapsed: ", collapsedNode.data);
     * }
     * ```
     */
    @Output()
    public stepCollapsed = new EventEmitter<IStepToggledEventArgs>();

    /**
     * Emitted when the active node is changed.
     *
     * @example
     * ```
     * <igx-tree (activeNodeChanged)="activeNodeChanged($event)"></igx-tree>
     * ```
     */
    @Output()
    public activeStepChanged = new EventEmitter<IgxStepComponent>();

    /** @hidden @internal */
    @ContentChildren(IgxStepComponent, { descendants: false })
    public steps: QueryList<IgxStepComponent>;

    // /** @hidden @internal */
    // public disabledChange = new EventEmitter<IgxStepComponent>();

    private destroy$ = new Subject<void>();
    private unsubChildren$ = new Subject<void>();
    private _orientation: IgxStepperOrienatation | string = IgxStepperOrienatation.Vertical;

    constructor(
        public stepperService: IgxStepperService,
        private element: ElementRef<HTMLElement>,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions?: IDisplayDensityOptions) {
        super(_displayDensityOptions);
        this.stepperService.register(this);
        // this.navService.register(this);
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
        super.ngOnInit();
        // this.disabledChange.pipe(takeUntil(this.destroy$)).subscribe((e) => {
        //     this.navService.update_disabled_cache(e);
        // });


        //dali ni trqbva
        // this.activeNodeBindingChange.pipe(takeUntil(this.destroy$)).subscribe((node) => {
        //     this.expandToNode(this.navService.activeNode);
        //     this.scrollNodeIntoView(node?.header?.nativeElement);
        // });



        // this.onDensityChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
        //     requestAnimationFrame(() => {
        //         this.scrollNodeIntoView(this.navService.activeStep?.header.nativeElement);
        //     });
        // });
        this.subToCollapsing();
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        this.steps.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.subToChanges();
        });
        // this.scrollNodeIntoView(this.navService.activeNode?.header?.nativeElement);
        this.subToChanges();
        this.steps.forEach(s => {
            s.horizontalContainer = this.contentTemplate;
        });
    }

    /** @hidden @internal */
    public ngOnDestroy() {
        this.unsubChildren$.next();
        this.unsubChildren$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }

    private subToCollapsing() {
        this.stepCollapsing.pipe(takeUntil(this.destroy$)).subscribe(event => {
            if (event.cancel) {
                return;
            }
            // this.navService.update_visible_cache(event.node, false);
        });
        this.stepExpanding.pipe(takeUntil(this.destroy$)).subscribe(event => {
            if (event.cancel) {
                return;
            }
            // this.navService.update_visible_cache(event.node, true);
        });
    }

    private subToChanges() {
        this.unsubChildren$.next();
        this.steps.forEach(step => {
            step.expandedChange.pipe(takeUntil(this.unsubChildren$)).subscribe(nodeState => {
                // this.navService.update_visible_cache(node, nodeState);
            });
            step.closeAnimationDone.pipe(takeUntil(this.unsubChildren$)).subscribe(() => {
                // const targetElement = this.navService.focusedNode?.header.nativeElement;
                // this.scrollNodeIntoView(targetElement);
            });
            step.openAnimationDone.pipe(takeUntil(this.unsubChildren$)).subscribe(() => {
                // const targetElement = this.navService.focusedNode?.header.nativeElement;
                // this.scrollNodeIntoView(targetElement);
            });
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
        IgxStepContentDirective
    ],
    exports: [
        IgxStepComponent,
        IgxStepperComponent,
        IgxStepLabelDirective,
        IgxStepIconDirective,
        IgxStepValidIconDirective,
        IgxStepInvalidIconDirective,
        IgxStepContentDirective
    ]
})
export class IgxStepperModule { }
