import { booleanAttribute, Component, HostBinding, Input } from '@angular/core';
import { IgxIconComponent } from 'igniteui-angular/icon';

let NEXT_ID = 0;

/**
 * Determines the igxBadge type
 */
export const IgxBadgeType = {
    PRIMARY: 'primary',
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
} as const;
export type IgxBadgeType = (typeof IgxBadgeType)[keyof typeof IgxBadgeType];
/**
 * Badge provides visual notifications used to decorate avatars, menus, etc.
 *
 * @remarks
 * The Ignite UI Badge is used to decorate avatars, navigation menus, or other components in the
 * application when visual notification is needed. They are usually designed as icons with a predefined
 * style to communicate information, success, warnings, or errors.
 */
@Component({
    selector: 'igx-badge',
    templateUrl: 'badge.component.html',
    imports: [IgxIconComponent]
})
export class IgxBadgeComponent {

   /**
    * Sets/gets the `id` of the badge.
    *
    * @remarks
    * If not set, the `id` will have value `"igx-badge-0"`.
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
    */
    @Input()
    public type: string | IgxBadgeType = IgxBadgeType.PRIMARY;

   /**
    * Sets/gets the value to be displayed inside the badge.
    *
    * @remarks
    * If an `icon` property is already set the `icon` will be displayed.
    * If neither a `value` nor an `icon` is set the content of the badge will be empty.
    */
    @Input()
    public value: string | number = '';

    /**
     * Sets/gets an icon for the badge from the material icons set.
     *
     * @remarks
     * Has priority over the `value` property.
     * If neither a `value` nor an `icon` is set the content of the badge will be empty.
     * Providing an invalid value won't display anything.
     */
    @Input()
    public icon: string;

    /**
     * The name of the icon set. Used in case the icon is from a different icon set.
     */
    @Input()
    public iconSet: string;

    /**
     * Sets/gets the role attribute value.
     *
     * @ViewChild("MyBadge", { read: IgxBadgeComponent })
     * public badge: IgxBadgeComponent;
     *
     * badge.role = 'status';
     */
    @HostBinding('attr.role')
    public role = 'status';

    /**
     * Sets/gets the css class to use on the badge.
     *
     * @ViewChild("MyBadge", { read: IgxBadgeComponent })
     * public badge: IgxBadgeComponent;
     *
     * badge.cssClass = 'my-badge-class';
     */
    @HostBinding('class.igx-badge')
    public cssClass = 'igx-badge';

    /**
     * Sets a square shape to the badge, if `shape` is set to `square`.
     * By default the shape of the badge is rounded.
     */
    @Input()
    public shape: 'rounded' | 'square' = 'rounded';

    /** @hidden @internal */
    @HostBinding('class.igx-badge--square')
    public get _squareShape(): boolean {
        if (!this.dot) {
            return this.shape === 'square';
        }
    }

    /**
     * Sets/gets the aria-label attribute value.
     *
     * @ViewChild("MyBadge", { read: IgxBadgeComponent })
     * public badge: IgxBadgeComponent;
     *
     * badge.label = 'badge';
     */
    @HostBinding('attr.aria-label')
    public label = 'badge';

    /**
     * Sets/gets whether the badge is outlined.
     * Default value is `false`.
     */
    @Input({transform: booleanAttribute})
    @HostBinding('class.igx-badge--outlined')
    public outlined = false;

    /**
     * Sets/gets whether the badge is displayed as a dot.
     * When true, the badge will be rendered as a minimal 8px indicator without any content.
     * Default value is `false`.
     */
    @Input({transform: booleanAttribute})
    @HostBinding('class.igx-badge--dot')
    public dot = false;

    /**
     * Defines a human-readable, accessor, author-localized description for
     * the `type` and the `icon` or `value` of the element.
     *
     * @hidden
     * @internal
     */
    @HostBinding('attr.aria-roledescription')
    public get roleDescription() {
        if (this.icon) {
            return this.type + ' type badge with icon type ' + this.icon;
        } else if (this.value || this.value === 0) {
            return this.type + ' badge type with value ' + this.value;
        }
        return this.type + ' badge type without value';
    }

    @HostBinding('class.igx-badge--info')
    public get infoClass() {
        return this.type === IgxBadgeType.INFO;
    }

    @HostBinding('class.igx-badge--success')
    public get successClass() {
        return this.type === IgxBadgeType.SUCCESS;
    }

    @HostBinding('class.igx-badge--warning')
    public get warningClass() {
        return this.type === IgxBadgeType.WARNING;
    }

    @HostBinding('class.igx-badge--error')
    public get errorClass() {
        return this.type === IgxBadgeType.ERROR;
    }
}
