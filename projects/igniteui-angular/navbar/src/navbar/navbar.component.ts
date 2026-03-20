import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    Directive,
    ContentChild,
    booleanAttribute
} from '@angular/core';

import { IgxIconComponent } from 'igniteui-angular/icon';

/**
 * IgxActionIcon is a container for the action nav icon of the IgxNavbar.
 */
@Directive({
    selector: '[igxNavbarAction],igx-navbar-action',
    standalone: true
})
export class IgxNavbarActionDirective { }

@Directive({
    selector: '[igxNavbarTitle],igx-navbar-title',
    standalone: true
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
 */

@Component({
    selector: 'igx-navbar',
    templateUrl: 'navbar.component.html',
    styles: [`
        :host {
            display: block;
            width: 100%;
        }
    `
    ],
    imports: [IgxIconComponent]
})

export class IgxNavbarComponent {
    /**
     * Sets the value of the `id` attribute. If not provided it will be automatically generated.
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-navbar-${NEXT_ID++}`;

    /**
     * Sets the icon of the `IgxNavbarComponent`.
     */
    @Input() public actionButtonIcon: string;

    /**
     * Sets the title of the `IgxNavbarComponent`.
     */
    @Input() public title: string;

    /**
     * The event that will be thrown when the action is executed,
     * provides reference to the `IgxNavbar` component as argument
     */
    @Output() public action = new EventEmitter<IgxNavbarComponent>();

    /**
     * Sets the titleId of the `IgxNavbarComponent`. If not set it will be automatically generated.
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
     */
    public set isActionButtonVisible(value: boolean) {
        this.isVisible = value;
    }

    /**
     * Returns whether the `IgxNavbarComponent` action button is visible, true/false.
     */
    @Input({ transform: booleanAttribute })
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

