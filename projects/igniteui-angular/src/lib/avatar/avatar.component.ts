import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    HostBinding,
    Input,
    NgModule,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { IgxIconModule } from '../icon/index';

let NEXT_ID = 0;

export enum IgxAvatarSize {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large'
}

export enum IgxAvatarType {
    INITIALS = 'initials',
    IMAGE = 'image',
    ICON = 'icon',
    CUSTOM = 'custom',
}

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
 * <igx-avatar initials="MS" roundShape="true" size="large">
 * </igx-avatar>
 * ```
 */
@Component({
    selector: 'igx-avatar',
    templateUrl: 'avatar.component.html'
})
export class IgxAvatarComponent implements OnInit, AfterViewInit {

    /**
     * This is a reference to the avatar image element in the DOM.
     *
     * @example
     * ```typescript
     *  let image = this.avatar.image;
     * ```
     */
    @ViewChild('image')
    public image: ElementRef;

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
     * Sets a round shape to the avatar, if `roundShape` is set to `true`.
     * By default the shape of the avatar is a square.
     *
     * @example
     * ```html
     * <igx-avatar roundShape="true" ></igx-avatar>
     * ```
     */

    @HostBinding('class.igx-avatar--rounded')
    @Input()
    public roundShape = false;

    /**
     * Sets the color of the avatar's initials or icon.
     *
     * @example
     *```html
     *<igx-avatar color="blue"></igx-avatar>
     *```
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
    public src: string;

    /**
     * @hidden
     * @internal
     */
    private _size: string | IgxAvatarSize = IgxAvatarSize.SMALL;
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
        return this._size;
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
    get type(): IgxAvatarType {
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

    /**
     * Returns the template of the avatar.
     *
     * @hidden
     * @internal
     */
    get template(): TemplateRef<any> {
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

    /** @hidden @internal */
    public ngOnInit() {
        this.roleDescription = this.getRole();
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        if (this.type !== IgxAvatarType.CUSTOM) {
            this.elementRef.nativeElement.classList.add(`igx-avatar--${this.type}`);
        }

        this.elementRef.nativeElement.classList.add(`igx-avatar--${this._size}`);
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

    /**
     * Returns the css url of the image.
     *
     * @hidden
     * @internal
     */
    public getSrcUrl() {
        return `url(${this.src})`;
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxAvatarComponent],
    exports: [IgxAvatarComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxAvatarModule { }
