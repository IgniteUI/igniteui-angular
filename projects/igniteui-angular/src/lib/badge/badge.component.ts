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
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-badge-${NEXT_ID++}`;

    /**
    * An @Input property controlling the type of the badge.
    * Allowed values are `default`, `info`, `success`, `warning`, `error`.
    * Providing an invalid value won't display a badge.
    */
    @Input()
    public type: string | Type = 'default';

    /**
    * An @Input property that sets the value to be displayed inside the badge.
    * If an `icon` property is already set the `icon` will be displayed.
    * If neither a `value` nor an `icon` is set the contentent of the badge will be empty.
    */
    @Input()
    public value = '';

    /**
     * Set an icon for the badge from the material icons set.
     * Has priority over the `value` property.
     * If neither a `value` nor an `icon` is set the content of the badge will be empty.
     * Providing an invalid value won't display anything.
     */
    @Input()
    public icon: string;

    /**
     * Set the value of the `role` attribute.
     */
    @HostBinding('attr.role')
    public role = 'status';

    /**
     * This allows you to set class to the badge. The default value is igx-badge.
     */
    @HostBinding('class.igx-badge')
    public cssClass = 'igx-badge';

    /**
     * Set the value of the `aria-label` attribute.
     */
    @HostBinding('attr.aria-label')
    public label = 'badge';

    /**
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
     *
     * Method which makes the name of the class more descriptive.
     * This helps the styling of the badges.
     */
    public setClasses() {
        let classes = {};

        switch (Type[this.type.toUpperCase()]) {
            case Type.DEFAULT:
                classes = {
                    [`${this.cssClass}__state--default`]: true
                };
                break;
            case Type.INFO:
                classes = {
                    [`${this.cssClass}__state--info`]: true
                };
                break;
            case Type.SUCCESS:
                classes = {
                    [`${this.cssClass}__state--success`]: true
                };
                break;
            case Type.WARNING:
                classes = {
                    [`${this.cssClass}__state--warning`]: true
                };
                break;
            case Type.ERROR:
                classes = {
                    [`${this.cssClass}__state--error`]: true
                };
                break;
        }

        return classes;
    }

}

@NgModule({
    declarations: [IgxBadgeComponent],
    exports: [IgxBadgeComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxBadgeModule {
}
