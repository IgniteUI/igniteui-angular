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
 * **Ignite UI for Angular Avatar** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/avatar.html)
 *
 * The Ignite UI Avatar provides an easy way to add an avatar icon to your application.  This icon can be an
 * image, someone's initials or a material icon from the google material icon set.
 *
 * Example:
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
     * This is a reference to the avatar `image` element in the DOM.
     *
     * ```typescript
     *  let image =  this.avatar.image;
     * ```
     * @memberof IgxAvatarComponent
     */
    @ViewChild('image')
    public image: ElementRef;

    /**
     *@hidden
     */
    @ViewChild('defaultTemplate', { read: TemplateRef })
    protected defaultTemplate: TemplateRef<any>;

    /**
     *@hidden
     */
    @ViewChild('imageTemplate', { read: TemplateRef })
    protected imageTemplate: TemplateRef<any>;

    /**
     *@hidden
     */
    @ViewChild('initialsTemplate', { read: TemplateRef })
    protected initialsTemplate: TemplateRef<any>;

    /**
     *@hidden
     */
    @ViewChild('iconTemplate', { read: TemplateRef })
    protected iconTemplate: TemplateRef<any>;

    /**
     * Returns the `aria-label` of the avatar.
     *
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
     * ```typescript
     * let avatarRole = this.avatar.role;
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @HostBinding('attr.role')
    public role = 'img';

    /**
     * Returns the class of the avatar.
     *
     * ```typescript
     * let avatarCLass =  this.avatar.cssClass;
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @HostBinding('class.igx-avatar')
    public cssClass = 'igx-avatar';

    /**
     * Returns the type of the avatar.
     * The avatar can be: `"initials type avatar"`, `"icon type avatar"` or `"image type avatar"`.
     *
     * ```typescript
     * let avatarDescription = this.avatar.roleDescription;
     * ```
     *
     * @memberof IgxAvatarComponent
     */

    @HostBinding('attr.aria-roledescription')
    public roleDescription: string;

    /**
     * @hidden
     */
    private _size: string | Size = 'small';

    /**
     * Sets the `id` of the avatar. If not set, the first avatar component will have `id` = `"igx-avatar-0"`.
     *
     * ```html
     * <igx-avatar id="my-first-avatar"></igx-avatar>
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-avatar-${NEXT_ID++}`;

    /**
     * Sets a round shape to the avatar if `roundShape` is `"true"`.
     * By default the shape of the avatar is a square.
     *
     * ```html
     * <igx-avatar roundShape = "true" ></igx-avatar>
     * ```
     *
     * @memberof IgxAvatarComponent
     */

    @HostBinding('class.igx-avatar--rounded')
    @Input()
    public roundShape = false;

    /**
     * Sets the avatar's `initials`/`icon` color.
     *
     *```html
     *<igx-avatar color="blue"></igx-avatar>
     *```
     *
     * @memberof IgxAvatarComponent
     */

    @HostBinding('style.color')
    @Input()
    public color: string;

    /**
     * Sets the background color of the avatar.
     *
     * ```html
     * <igx-avatar bgColor="yellow"></igx-avatar>
     * ```
     *
     * @memberof IgxAvatarComponent
     */

    @HostBinding('style.background')
    @Input()
    public bgColor: string;

    /**
     * Sets `initials` to the avatar.
     *
     * ```html
     * <igx-avatar initials="MN"></igx-avatar>
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @Input()
    public initials: string;

    /**
     * Sets an `icon` to the avatar. All icons from the material icon set are supported.
     *
     * ```html
     * <igx-avatar icon="phone"></igx-avatar>
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @Input()
    public icon: string;

    /**
     * Sets the `image` source of the avatar.
     *
     * ```html
     * <igx-avatar src="images/picture.jpg"></igx-avatar>
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @Input()
    public src: string;

    /**
     * Returns the `size` of the avatar.
     *
     * ```typescript
     *let avatarSize =  this.avatar.size;
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @Input()
    public get size(): string | Size {
        return this._size;
    }

    /**
     * Sets the `size`  of the avatar.
     * By default the `size` is `"small"`. It can be set to `"medium"` or `"large"`.
     *
     * ```
     * <igx-avatar size="large"></igx-avatar>
     * ```
     *
     * @memberof IgxAvatarComponent
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
     * ```typescript
     * let avatarType = this.avatar.type;
     * ```
     *
     * @memberof IgxAvatarComponent
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
     * ```typescript
     * let template = this.avatar.template;
     * ```
     *
     * @memberof IgxAvatarComponent
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
     * Returns the url of the `image`.
     *
     * ```typescript
     * let imageSourceUrl = this.avatar.getSrcUrl();
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    public getSrcUrl() {
        return `url(${this.src})`;
    }
}
/**
 * The `IgxAvatarModule` provides the {@link IgxAvatarComponent} inside your application.
 */
@NgModule({
    declarations: [IgxAvatarComponent],
    exports: [IgxAvatarComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxAvatarModule { }
