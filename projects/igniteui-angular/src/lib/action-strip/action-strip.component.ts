import {
    Component,
    ContentChildren,
    Directive,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    QueryList,
    Renderer2,
    TemplateRef,
    ViewContainerRef,
    Optional,
    Inject
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IgxDropDownModule} from '../drop-down/index';
import {IgxIconModule} from '../icon/index';
import {IgxToggleModule} from '../directives/toggle/toggle.directive';
import {IgxGridPinningActionsComponent} from './grid-actions/grid-pinning-actions.component';
import {IgxGridEditingActionsComponent} from './grid-actions/grid-editing-actions.component';
import {IgxGridActionsBaseDirective} from './grid-actions/grid-actions-base.directive';
import {IgxButtonModule} from '../directives/button/button.directive';
import {IgxRippleModule} from '../directives/ripple/ripple.directive';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';

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

export class IgxActionStripComponent extends DisplayDensityBase {
    constructor(
        private _viewContainer: ViewContainerRef,
        private renderer: Renderer2,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
            super(_displayDensityOptions);
         }

    /**
     * @hidden
     * @internal
     * Sets/gets the 'display' property of the current `IgxActionStrip`
     */
    @HostBinding('style.display')
    public display = 'flex';

    private _hidden = false;

    /**
     * An @Input property that set the visibility of the Action Strip.
     * Could be used to set if the Action Strip will be initially hidden.
     * ```html
     *  <igx-action-strip [hidden]="false">
     * ```
     */
    @Input()
    public set hidden(value) {
        this._hidden = value;
        this.display = this._hidden ? 'none' : 'flex' ;
    }

    public get hidden() {
        return this._hidden;
    }

    /**
     * Host `class.igx-action-strip` binding.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-action-strip')
    public cssClass = 'igx-action-strip';

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.class')
    get hostClass(): string {
        const classes = [this.getComponentDensityClass('igx-action-strip')];
        // The custom classes should be at the end.
        classes.push(this.cssClass);
        return classes.join(' ');
    }

    public context;

    @ContentChildren(forwardRef(() => IgxGridActionsBaseDirective), { descendants: true })
    public gridActions: QueryList<IgxGridActionsBaseDirective>;

    @ContentChildren(IgxActionStripMenuItemDirective)
    public menuItems: QueryList<IgxActionStripMenuItemDirective>;

    show(context): void {
        this.context = context;
        this.hidden = false;
        this.renderer.appendChild(context.element.nativeElement, this._viewContainer.element.nativeElement);
        this.sendContext();
    }

    hide(): void {
        this.hidden = true;
        this.renderer.removeChild(this.context.element.nativeElement, this._viewContainer.element.nativeElement);
    }

    private sendContext() {
        if (this.gridActions) {
            this.gridActions.forEach(action => action.context = this.context);
        }
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
    imports: [CommonModule, IgxDropDownModule, IgxToggleModule, IgxButtonModule, IgxIconModule, IgxRippleModule]
})
export class IgxActionStripModule { }
