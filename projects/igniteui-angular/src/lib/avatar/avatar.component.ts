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

export enum Size {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large'
}

export enum AvatarType {
    DEFAULT = 'default',
    INITIALS = 'initials',
    IMAGE = 'image',
    ICON = 'icon'
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

    /**
     *@hidden
     */
    @ViewChild('defaultTemplate', { read: TemplateRef, static: true })
    protected defaultTemplate: TemplateRef<any>;

    /**
     *@hidden
     */
    @ViewChild('imageTemplate', { read: TemplateRef, static: true })
    protected imageTemplate: TemplateRef<any>;

    /**
     *@hidden
     */
    @ViewChild('initialsTemplate', { read: TemplateRef, static: true })
    protected initialsTemplate: TemplateRef<any>;

    /**
     *@hidden
     */
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
     * Returns the `class` attribute of the avatar.
     *
     * @example
     * ```typescript
     * let avatarCLass =  this.avatar.cssClass;
     * ```
     */
    @HostBinding('class.igx-avatar')
    public cssClass = 'igx-avatar';

    /**
     * Returns the type of the avatar.
     * The avatar can be: `"initials type avatar"`, `"icon type avatar"` or `"image type avatar"`
     *
     * @example
     * ```typescript
     * let avatarDescription = this.avatar.roleDescription;
     * ```
     */

    @HostBinding('attr.aria-roledescription')
    public roleDescription: string;

    /**
     * @hidden
     */
    private _size: string | Size = 'small';

    /**
     * Sets the `id` of the avatar. If not set, the first avatar component will have an `id` = `"igx-avatar-0"`.
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
     */
    @Input()
    public src: string;

    /**
     * Returns the size of the avatar.
     *
     * @example
     * ```typescript
     * let avatarSize = this.avatar.size;
     * ```
     */
    @Input()
    public get size(): string | Size {
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
    public set size(value: string | Size) {
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
    get type(): AvatarType {
        if (this.src) {
            return AvatarType.IMAGE;
        }

        if (this.icon) {
            return AvatarType.ICON;
        }

        if (this.initials) {
            return AvatarType.INITIALS;
        }

        return AvatarType.DEFAULT;
    }

    /**
     * Returns the template of the avatar.
     *
     * @example
     * ```typescript
     * let template = this.avatar.template;
     * ```
     */
    get template(): TemplateRef<any> {
        switch (this.type) {
            case AvatarType.IMAGE:
                return this.imageTemplate;
            case AvatarType.INITIALS:
                return this.initialsTemplate;
            case AvatarType.ICON:
                return this.iconTemplate;
            default:
                return this.defaultTemplate;
        }
    }

    constructor(public elementRef: ElementRef) { }

    /**
     * @hidden
     */
    public ngOnInit() {
        this.roleDescription = this.getRole();
    }

    /**
     *@hidden
     */
    public ngAfterViewInit() {
        this.elementRef.nativeElement.classList
            .add(`igx-avatar--${this._size}`, `igx-avatar--${this.type}`);
    }

    /**
     * @hidden
     */
    private getRole(): string {
        switch (this.type) {
            case AvatarType.IMAGE:
                return 'image avatar';
            case AvatarType.ICON:
                return 'icon avatar';
            case AvatarType.INITIALS:
                return 'initials avatar';
            default:
                return 'custom avatar';
        }
    }

    /**
     * Returns the url of the image.
     *
     * @example
     * ```typescript
     * let imageSourceUrl = this.avatar.getSrcUrl();
     * ```
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
