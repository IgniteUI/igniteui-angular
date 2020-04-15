import { Component,
    NgModule,
    Input,
    ViewContainerRef,
    Renderer2,
    HostBinding,
    ContentChild,
    ContentChildren,
    TemplateRef,
    QueryList,
    Directive,
    forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxDropDownModule } from '../drop-down/index';
import { IgxIconModule } from '../icon/index';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxGridPinningActionsComponent } from './grid-actions/grid-pinning-actions.component';
import { IgxGridEditingActionsComponent } from './grid-actions/grid-editing-actions.component';
import { IgxGridActionsBaseDirective } from './grid-actions/grid-actions-base.directive';

@Directive({
    selector: '[igxActionStripMenuItem]'
})
export class IgxActionStripMenuItemDirective {
    constructor(
        public templateRef: TemplateRef<any>
    ) { }
}

/**
 * Action Strip provides templatable area for one or more actions.
 *
 * @igxModule IgxActionStripModule
 *
 * @igxTheme igx-action-strip-theme
 *
 * @igxKeywords action, strip, actionStrip, pinning, editing
 *
 * @igxGroup Data Entry & Display
 *
 * @remarks
 * The Ignite UI Action Strip is a container, overlaying its parent container,
 * and displaying action buttons with action applicable to the parent component the strip is instantiated or shown for.
 *
 * @example
 * ```html
 * <igx-action-strip #actionStrip>
 *     <igx-icon (click)="doSomeAction()"></igx-icon>
 * </igx-action-strip>
 */
@Component({
    selector: 'igx-action-strip',
    templateUrl: 'action-strip.component.html'
})

export class IgxActionStripComponent {
    constructor(
        private _viewContainer: ViewContainerRef,
        private renderer: Renderer2) { }

    /**
     * An @Input property that set the visibility of the Action Strip.
     * Could be used to set if the Action Strip will be initially hidden.
     * ```html
     *  <igx-action-strip [hidden]="false">
     * ```
     */
    @Input() hidden = false;


    /**
     * Host `class.igx-action-strip` binding.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-action-strip')
    public cssClass = 'igx-action-strip';

    public context;

    @ContentChildren(forwardRef(() => IgxGridActionsBaseDirective), { descendants: true })
    public gridActions: QueryList<IgxGridActionsBaseDirective>;

    @ContentChildren(IgxActionStripMenuItemDirective)
    public menuItems: QueryList<IgxActionStripMenuItemDirective>;

    show(context): void {
        this.context = context;
        this.hidden = false;
        this.context = context;
        this.renderer.appendChild(context.element.nativeElement, this._viewContainer.element.nativeElement);
        this.sendContext();
    }

    hide(): void {
        this.hidden = true;
        this.renderer.removeChild(this.context.element.nativeElement, this._viewContainer.element.nativeElement);
    }

    private sendContext() {
        this.gridActions.forEach(action => action.context = this.context);
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxActionStripComponent,
        IgxActionStripMenuItemDirective,
        IgxGridPinningActionsComponent,
        IgxGridEditingActionsComponent,
        IgxGridActionsBaseDirective
    ],
    exports: [
        IgxActionStripComponent,
        IgxActionStripMenuItemDirective,
        IgxGridPinningActionsComponent,
        IgxGridEditingActionsComponent,
        IgxGridActionsBaseDirective
    ],
    imports: [CommonModule, IgxDropDownModule, IgxToggleModule, IgxIconModule]
})
export class IgxActionStripModule { }
