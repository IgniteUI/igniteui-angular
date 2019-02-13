import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, NgModule } from '@angular/core';
import { IgxIconModule } from '../icon/index';

let NEXT_ID = 0;

export enum Type {
    DEFAULT = 'default',
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}
/**
 * **Ignite UI for Angular Badge** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/badge.html)
 *
 * The Ignite UI Badge is used to decorate avatars, navigation menus, or other components in the
 * application when visual notification is needed. They are usually designed as icons with a predefined
 * style to communicate information, success, warnings, or errors.
 *
 * Example:
 * ```html
 * <igx-avatar icon="person" roundShape="true" size="small">
 *   <igx-badge icon="check" type="success" class="badge-style">
 *   </igx-badge>
 * </igx-avatar>
 * ```
 * The `badge-style` class is used to position the badge:
 * ```css
 * .badge-style {
 *   position: absolute;
 *   bottom: -6px;
 *   right:-50px;
 * }
 * ```
 */
@Component({
    selector: 'igx-badge',
    templateUrl: 'badge.component.html'
})
export class IgxBadgeComponent {

    /**
    * An @Input property that sets the value of the `id` attribute.
    * ```html
    *<igx-badge id="igx-badge-2" icon="check" type="success" class="badge-style"></igx-badge>
    * ```
    */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-badge-${NEXT_ID++}`;

    /**
    * An @Input property controlling the type of the badge.
    * Allowed values are `default`, `info`, `success`, `warning`, `error`.
    * Providing an invalid value won't display a badge.
    * ```html
    *<igx-badge type="success" icon="check" class="badge-style"></igx-badge>
    * ```
    */
    @Input()
    public type: string | Type = 'default';

    /**
    * An @Input property that sets the value to be displayed inside the badge.
    * If an `icon` property is already set the `icon` will be displayed.
    * If neither a `value` nor an `icon` is set the contentent of the badge will be empty.
    * ```html
    *<igx-badge value="11" type="success" class="badge-style"></igx-badge>
    * ```
    */
    @Input()
    public value = '';

    /**
     * Set an icon for the badge from the material icons set.
     * Has priority over the `value` property.
     * If neither a `value` nor an `icon` is set the content of the badge will be empty.
     * Providing an invalid value won't display anything.
     * ```html
     *<igx-badge icon="check" type="success" class="badge-style" value="11"></igx-badge>
     * ```
     */
    @Input()
    public icon: string;

    /**
     * This allows you to set value to role attribute.
     *```html
     *@ViewChild("MyBadge", { read: IgxBadgeComponent })
     *public badge: IgxBadgeComponent;
     * //...
     *badge.label = "badge-status";
     * ```
     */
    @HostBinding('attr.role')
    public role = 'status';

    /**
     * This allows you to disable igx-badge class. The default it's applied.
     *```html
     *@ViewChild("MyBadge", { read: IgxBadgeComponent })
     *public badge: IgxBadgeComponent;
     * //...
     *badge.cssClass = false;
     * ```
     */
    @HostBinding('class.igx-badge')
    public cssClass = 'igx-badge';

    /**
     * This allows you to set value to aria-label attribute.
     *```html
     *@ViewChild("MyBadge", { read: IgxBadgeComponent })
     *public badge: IgxBadgeComponent;
     * //...
     *badge.label = "icon-badge";
     * ```
     */
    @HostBinding('attr.aria-label')
    public label = 'badge';

    /**
     * @hidden
     * Defines a human-readable, accessor, author-localized description for the `type` and the `icon` or `value` of the element.
     */
    get roleDescription() {
        let message;

        // tslint:disable-next-line:prefer-conditional-expression
        if (this.icon) {
            message = this.type + ' type badge with icon type ' + this.icon;
        } else if (this.value) {
            message = this.type + ' badge type with value ' + this.value;
        } else {
            message = this.type + ' badge type without value';
        }

        return message;
    }

    /**
     * @hidden
     * Method which makes the name of the class more descriptive.
     * This helps the styling of the badges.
     */
    public setClasses() {
        let classes = {};

        switch (Type[this.type.toUpperCase()]) {
            case Type.DEFAULT:
                classes = {
                    [`${this.cssClass}__circle--default`]: true
                };
                break;
            case Type.INFO:
                classes = {
                    [`${this.cssClass}__circle--info`]: true
                };
                break;
            case Type.SUCCESS:
                classes = {
                    [`${this.cssClass}__circle--success`]: true
                };
                break;
            case Type.WARNING:
                classes = {
                    [`${this.cssClass}__circle--warning`]: true
                };
                break;
            case Type.ERROR:
                classes = {
                    [`${this.cssClass}__circle--error`]: true
                };
                break;
        }

        return classes;
    }

}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxBadgeComponent],
    exports: [IgxBadgeComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxBadgeModule {
}
