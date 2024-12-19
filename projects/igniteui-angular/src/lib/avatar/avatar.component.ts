import { NgTemplateOutlet } from '@angular/common';
import {
    Component,
    ElementRef,
    HostBinding,
    Input,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';

import { mkenum, normalizeURI } from '../core/utils';
import { IgxIconComponent } from '../icon/icon.component';

let NEXT_ID = 0;
export const IgxAvatarSize = /*@__PURE__*/mkenum({
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
});
export type IgxAvatarSize = (typeof IgxAvatarSize)[keyof typeof IgxAvatarSize];

export const IgxAvatarType = /*@__PURE__*/mkenum({
    INITIALS: 'initials',
    IMAGE: 'image',
    ICON: 'icon',
    CUSTOM: 'custom'
});
export type IgxAvatarType = (typeof IgxAvatarType)[keyof typeof IgxAvatarType];

/**
 * Avatar provides a way to display an image, icon or initials to the user.
 *
 * @igxModule IgxAvatarModule
 *
 * @igxTheme igx-avatar-theme, igx-icon-theme
 *
 * @igxKeywords avatar, profile, picture, initials
 *
 * @igxGroup Layouts
 *
 * @remarks
 *
 * The Ignite UI Avatar provides an easy way to add an avatar icon to your application.  This icon can be an
 * image, someone's initials or a material icon from the Google Material icon set.
 *
 * @example
 * ```html
 * <igx-avatar initials="MS" shape="rounded" size="large">
 * </igx-avatar>
 * ```
 */
@Component({
    selector: 'igx-avatar',
    templateUrl: 'avatar.component.html',
    imports: [IgxIconComponent, NgTemplateOutlet]
})
export class IgxAvatarComponent implements OnInit {
    /**
     * Returns the `aria-label` attribute of the avatar.
     *
     * @example
     * ```typescript
     * let ariaLabel = this.avatar.ariaLabel;
     * ```
     *
     */
    @HostBinding('attr.aria-label')
    public ariaLabel = 'avatar';

    /**
     * Returns the `role` attribute of the avatar.
     *
     * @example
     * ```typescript
     * let avatarRole = this.avatar.role;
     * ```
     */
    @HostBinding('attr.role')
    public role = 'img';

    /**
     * Host `class.igx-avatar` binding.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-avatar')
    public cssClass = 'igx-avatar';

    /**
     * Returns the type of the avatar.
     * The avatar can be:
     * - `"initials type avatar"`
     * - `"icon type avatar"`
     * - `"image type avatar"`.
     * - `"custom type avatar"`.
     *
     * @example
     * ```typescript
     * let avatarDescription = this.avatar.roleDescription;
     * ```
     */
    @HostBinding('attr.aria-roledescription')
    public roleDescription: string;

    /**
     * Sets the `id` of the avatar. If not set, the first avatar component will have `id` = `"igx-avatar-0"`.
     *
     * @example
     * ```html
     * <igx-avatar id="my-first-avatar"></igx-avatar>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-avatar-${NEXT_ID++}`;

    /**
     * Sets square, rounded or circular shape to the avatar.
     * By default the shape of the avatar is square.
     *
     * @example
     * ```html
     * <igx-avatar shape="rounded"></igx-avatar>
     * ```
     */
    @Input()
    public shape: 'square' | 'rounded' | 'circle' = 'square';

    /** @hidden @internal */
    @HostBinding('class.igx-avatar--rounded')
    public get isRounded(): boolean {
        return this.shape === 'rounded';
    }

    /** @hidden @internal */
    @HostBinding('class.igx-avatar--circle')
    public get isCircle(): boolean {
        return this.shape === 'circle';
    }

    /**
     * Sets the color of the avatar's initials or icon.
     *
     * @example
     * ```html
     * <igx-avatar color="blue"></igx-avatar>
     * ```
     * @deprecated in version 17.2.0.
     */

    @HostBinding('style.color')
    @Input()
    public color: string;

    /**
     * Sets the background color of the avatar.
     *
     * @example
     * ```html
     * <igx-avatar bgColor="yellow"></igx-avatar>
     * ```
     * @igxFriendlyName Background color
     * @deprecated in version 17.2.0.
     */

    @HostBinding('style.background')
    @Input()
    public bgColor: string;

    /**
     * Sets initials to the avatar.
     *
     * @example
     * ```html
     * <igx-avatar initials="MN"></igx-avatar>
     * ```
     */
    @Input()
    public initials: string;

    /**
     * Sets an icon to the avatar. All icons from the material icon set are supported.
     *
     * @example
     * ```html
     * <igx-avatar icon="phone"></igx-avatar>
     * ```
     */
    @Input()
    public icon: string;

    /**
     * Sets the image source of the avatar.
     *
     * @example
     * ```html
     * <igx-avatar src="images/picture.jpg"></igx-avatar>
     * ```
     * @igxFriendlyName Image URL
     */
    @Input()
    public set src(value: string) {
        this._src = normalizeURI(value);
    }

    public get src() {
        return this._src;
    }

    /** @hidden @internal */
    @ViewChild('defaultTemplate', { read: TemplateRef, static: true })
    protected defaultTemplate: TemplateRef<any>;

    /** @hidden @internal */
    @ViewChild('imageTemplate', { read: TemplateRef, static: true })
    protected imageTemplate: TemplateRef<any>;

    /** @hidden @internal */
    @ViewChild('initialsTemplate', { read: TemplateRef, static: true })
    protected initialsTemplate: TemplateRef<any>;

    /** @hidden @internal */
    @ViewChild('iconTemplate', { read: TemplateRef, static: true })
    protected iconTemplate: TemplateRef<any>;

    /**
     * @hidden
     * @internal
     */
    private _size: string | IgxAvatarSize;
    private _src: string;

    /**
     * Returns the size of the avatar.
     *
     * @example
     * ```typescript
     * let avatarSize = this.avatar.size;
     * ```
     */
    @Input()
    public get size(): string | IgxAvatarSize {
        return this._size || IgxAvatarSize.SMALL;
    }

    /**
     * Sets the size  of the avatar.
     * By default, the size is `"small"`. It can be set to `"medium"` or `"large"`.
     *
     * @example
     * ```html
     * <igx-avatar size="large"></igx-avatar>
     * ```
     */
    public set size(value: string | IgxAvatarSize) {
        switch (value) {
            case 'small':
            case 'medium':
            case 'large':
                this._size = value;
                break;
            default:
                this._size = 'small';
        }
    }

    /**
     * Returns the type of the avatar.
     *
     * @example
     * ```typescript
     * let avatarType = this.avatar.type;
     * ```
     */
    public get type(): IgxAvatarType {
        if (this.src) {
            return IgxAvatarType.IMAGE;
        }

        if (this.icon) {
            return IgxAvatarType.ICON;
        }

        if (this.initials) {
            return IgxAvatarType.INITIALS;
        }

        return IgxAvatarType.CUSTOM;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-avatar--image')
    public get _isImageType(): boolean {
        return this.type === IgxAvatarType.IMAGE;
    }
    /** @hidden @internal */
    @HostBinding('class.igx-avatar--icon')
    public get _isIconType(): boolean {
        return this.type === IgxAvatarType.ICON;
    }
    /** @hidden @internal */
    @HostBinding('class.igx-avatar--initials')
    public get _isInitialsType(): boolean {
        return this.type === IgxAvatarType.INITIALS;
    }

    @HostBinding('style.--component-size')
    protected get componentSize() {
        if (this._size) {
            return `var(--ig-size-${this._size})`;
        }
    }

    /**
     * Returns the template of the avatar.
     *
     * @hidden
     * @internal
     */
    public get template(): TemplateRef<any> {
        switch (this.type) {
            case IgxAvatarType.IMAGE:
                return this.imageTemplate;
            case IgxAvatarType.INITIALS:
                return this.initialsTemplate;
            case IgxAvatarType.ICON:
                return this.iconTemplate;
            default:
                return this.defaultTemplate;
        }
    }

    constructor(public elementRef: ElementRef) { }

    /**
     * Returns the css url of the image.
     *
     * @hidden
     * @internal
     */
    public getSrcUrl() {
        return `url("${this.src}")`;
    }

    /** @hidden @internal */
    public ngOnInit() {
        this.roleDescription = this.getRole();
    }

    /** @hidden @internal */
    private getRole(): string {
        switch (this.type) {
            case IgxAvatarType.IMAGE:
                return 'image avatar';
            case IgxAvatarType.ICON:
                return 'icon avatar';
            case IgxAvatarType.INITIALS:
                return 'initials avatar';
            default:
                return 'custom avatar';
        }
    }
}

