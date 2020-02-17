import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, NgModule } from '@angular/core';
import { IgxIconModule } from '../icon/index';

let NEXT_ID = 0;

/**
 * Determines the igxBadge type
 */
export enum IgxBadgeType {
    PRIMARY = 'primary',
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}
/**
 * Badge provides visual notifications used to decorate avatars, menus, etc.
 *
 * @igxModule IgxBadgeModule
 *
 * @igxTheme igx-badge-theme
 *
 * @igxKeywords badge, icon, notification
 *
 * @igxGroup Data Entry & Display
 *
 * @remarks
 * The Ignite UI Badge is used to decorate avatars, navigation menus, or other components in the
 * application when visual notification is needed. They are usually designed as icons with a predefined
 * style to communicate information, success, warnings, or errors.
 *
 * @example
 * ```html
 * <igx-avatar>
 *   <igx-badge icon="check" type="success"></igx-badge>
 * </igx-avatar>
 */
@Component({
    selector: 'igx-badge',
    templateUrl: 'badge.component.html'
})
export class IgxBadgeComponent {

    /**
    * Sets/gets the `id` of the badge.
    *
    * @remarks
    * If not set, the `id` will have value `"igx-badge-0"`.
    *
    * @example
    * ```html
    * <igx-badge id="igx-badge-2"></igx-badge>
    * ```
    */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-badge-${NEXT_ID++}`;

    /**
    * Sets/gets the type of the badge.
    *
    * @remarks
    * Allowed values are `primary`, `info`, `success`, `warning`, `error`.
    * Providing an invalid value won't display a badge.
    *
    * @example
    * ```html
    * <igx-badge type="success"></igx-badge>
    * ```
    */
    @Input()
    public type: string | IgxBadgeType = IgxBadgeType.PRIMARY;

    /**
    * Sets/gets the value to be displayed inside the badge.
    *
    * @remarks
    * If an `icon` property is already set the `icon` will be displayed.
    * If neither a `value` nor an `icon` is set the content of the badge will be empty.
    *
    * @example
    * ```html
    * <igx-badge value="11"></igx-badge>
    * ```
    */
    @Input()
    public value = '';

    /**
     * Sets/gets an icon for the badge from the material icons set.
     *
     * @remarks
     * Has priority over the `value` property.
     * If neither a `value` nor an `icon` is set the content of the badge will be empty.
     * Providing an invalid value won't display anything.
     *
     * @example
     * ```html
     * <igx-badge icon="check"></igx-badge>
     * ```
     */
    @Input()
    public icon: string;

    /**
     * Sets/gets the role attribute value.
     *
     * @example
     * ```typescript
     * @ViewChild("MyBadge", { read: IgxBadgeComponent })
     * public badge: IgxBadgeComponent;
     *
     * badge.role = 'status';
     * ```
     */
    @HostBinding('attr.role')
    public role = 'status';

    /**
     * Sets/gets the the css class to use on the badge.
     *
     * @example
     * ```typescript
     * @ViewChild("MyBadge", { read: IgxBadgeComponent })
     * public badge: IgxBadgeComponent;
     *
     * badge.cssClass = 'my-badge-class';
     * ```
     */
    @HostBinding('class.igx-badge')
    public cssClass = 'igx-badge';

    /**
     * Sets/gets the aria-label attribute value.
     *
     * @example
     * ```typescript
     * @ViewChild("MyBadge", { read: IgxBadgeComponent })
     * public badge: IgxBadgeComponent;
     *
     * badge.label = 'badge';
     * ```
     */
    @HostBinding('attr.aria-label')
    public label = 'badge';

    /**
     * Defines a human-readable, accessor, author-localized description for
     * the `type` and the `icon` or `value` of the element.
     * @hidden
     * @internal
     */
    get roleDescription() {
        let message: string;

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
     * Method which makes the name of the class more descriptive.
     * This helps the styling of the badges.
     * @hidden
     * @internal
     */
    public setClasses() {
        let classes = {};

        switch (IgxBadgeType[this.type.toUpperCase()]) {
            case IgxBadgeType.INFO:
                classes = {
                    [`${this.cssClass}__circle--info`]: true
                };
                break;
            case IgxBadgeType.SUCCESS:
                classes = {
                    [`${this.cssClass}__circle--success`]: true
                };
                break;
            case IgxBadgeType.WARNING:
                classes = {
                    [`${this.cssClass}__circle--warning`]: true
                };
                break;
            case IgxBadgeType.ERROR:
                classes = {
                    [`${this.cssClass}__circle--error`]: true
                };
                break;
            default:
                classes = {
                    [`${this.cssClass}__circle--default`]: true
                };
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
export class IgxBadgeModule { }
