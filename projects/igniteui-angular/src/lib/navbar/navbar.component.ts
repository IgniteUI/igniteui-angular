import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    Output,
    Directive,
    ContentChild
} from '@angular/core';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxIconModule } from '../icon/public_api';

/**
 * IgxActionIcon is a container for the action nav icon of the IgxNavbar.
 */
@Directive({
    selector: 'igx-navbar-action,[igxNavbarAction]'
})
export class IgxNavbarActionDirective { }

@Directive({
    selector: 'igx-navbar-title,[igxNavbarTitle]'
})
export class IgxNavbarTitleDirective { }

let NEXT_ID = 0;
/**
 * **Ignite UI for Angular Navbar** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navbar.html)
 *
 * The Ignite UI Navbar is most commonly used to provide an app header with a hamburger menu and navigation
 * state such as a "Go Back" button. It also supports other actions represented by icons.
 *
 * Example:
 * ```html
 * <igx-navbar title="Sample App" actionButtonIcon="menu">
 *   <igx-icon>search</igx-icon>
 *   <igx-icon>favorite</igx-icon>
 *   <igx-icon>more_vert</igx-icon>
 * </igx-navbar>
 * ```
 */

@Component({
    selector: 'igx-navbar',
    templateUrl: 'navbar.component.html',
    styles: [`
        :host {
            display: block;
        }
    `
    ]
})

export class IgxNavbarComponent {
    /**
     * An @Input property that sets the value of the `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-navbar [id]="'igx-navbar-12'" title="Sample App" actionButtonIcon="menu">
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-navbar-${NEXT_ID++}`;

    /**
     * An @Input property that sets the icon of the `IgxNavbarComponent`.
     * ```html
     * <igx-navbar [title]="currentView" actionButtonIcon="arrow_back"></igx-navbar>
     * ```
     */
    @Input() public actionButtonIcon: string;

    /**
     * An @Input property that sets the title of the `IgxNavbarComponent`.
     * ```html
     * <igx-navbar title="Sample App" actionButtonIcon="menu">
     * ```
     */
    @Input() public title: string;

    /**
     * The event that will be thrown when the action is executed,
     * provides reference to the `IgxNavbar` component as argument
     * ```typescript
     * public actionExc(event){
     *     alert("Action Execute!");
     * }
     *  //..
     * ```
     * ```html
     * <igx-navbar (action)="actionExc($event)" title="Sample App" actionButtonIcon="menu">
     * ```
     */
    @Output() public action = new EventEmitter<IgxNavbarComponent>();

    /**
     * An @Input property that sets the titleId of the `IgxNavbarComponent`. If not set it will be automatically generated.
     * ```html
     * <igx-navbar [titleId]="'igx-navbar-7'" title="Sample App" actionButtonIcon="menu">
     * ```
     */
    @Input()
    public titleId = `igx-navbar-title-${NEXT_ID++}`;

    /**
     * @hidden
     */
    @ContentChild(IgxNavbarActionDirective, { read: IgxNavbarActionDirective })
    protected actionIconTemplate: IgxNavbarActionDirective;

    /**
     * @hidden
     */
    @ContentChild(IgxNavbarTitleDirective, { read: IgxNavbarTitleDirective })
    protected titleContent: IgxNavbarTitleDirective;

    private isVisible = true;

    /**
     * Sets whether the action button of the `IgxNavbarComponent` is visible.
     * ```html
     * <igx-navbar [title]="currentView" [isActionButtonVisible]="'false'"></igx-navbar>
     * ```
     */
    public set isActionButtonVisible(value: boolean) {
        this.isVisible = value;
    }

    /**
     * Returns whether the `IgxNavbarComponent` action button is visible, true/false.
     * ```typescript
     *  @ViewChild("MyChild")
     * public navBar: IgxNavbarComponent;
     * ngAfterViewInit(){
     *     let actionButtonVisibile = this.navBar.isActionButtonVisible;
     * }
     * ```
     */
    @Input()
    public get isActionButtonVisible(): boolean {
        if (this.actionIconTemplate || !this.actionButtonIcon) {
            return false;
        }
        return this.isVisible;
    }

    public get isTitleContentVisible(): boolean {
        return this.titleContent ? true : false;
    }

    /**
     * @hidden
     */
    public _triggerAction() {
        this.action.emit(this);
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxNavbarComponent, IgxNavbarActionDirective, IgxNavbarTitleDirective],
    exports: [IgxNavbarComponent, IgxNavbarActionDirective, IgxNavbarTitleDirective],
    imports: [IgxButtonModule, IgxIconModule, CommonModule]
})
export class IgxNavbarModule {
}
