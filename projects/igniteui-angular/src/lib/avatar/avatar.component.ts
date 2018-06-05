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
     * This is a reference to the avatar image element in the DOM.
     *
     * ```typescript
     *  this.avatar.image.style.backgroundImage = "images/picture.jpg";
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @ViewChild('image')
    public image: ElementRef;


    /**
     *@hidden
     *
     * @memberof IgxAvatarComponent
     */
    @ViewChild('imageTemplate', { read: TemplateRef })
    protected imageTemplate: TemplateRef<any>;

    /**
     *@hidden
     * @memberof IgxAvatarComponent
     */
    @ViewChild('initialsTemplate', { read: TemplateRef })
    protected initialsTemplate: TemplateRef<any>;
    /**
     *@hidden
     * @memberof IgxAvatarComponent
     */
    @ViewChild('iconTemplate', { read: TemplateRef })
    protected iconTemplate: TemplateRef<any>;
    /**
     * Indicates that the avatar's attribute aria-label is 'avatar'.
     * ```html
     * <igx-avatar aria-label="avatar"></igx-avatar>
     * ```
     * @memberof IgxAvatarComponent
     */
    @HostBinding('attr.aria-label')
    public ariaLabel = 'avatar';
    /**
     * Indicates that the avatar's attribute role is 'img'.
     *
     * ```html
     * <igx-avatar role="img"></igx-avatar>
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @HostBinding('attr.role')
    public role = 'img';
    /**
     * Initializes the avatar's class.
     *
     * ```html
     * <igx-avatar class="igx-avatar"></igx-avatar>
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    @HostBinding('class.igx-avatar')
    public cssClass = 'igx-avatar';
    /**
     * Describes what is the type of the avatar.
     * The avatar can be an initials type, icon type or an image type.
     *
     * ```typescript
     * let avatarDescription = this.avatar.roleDescription;
     * ```
     * @memberof IgxAvatarComponent
     */
    public roleDescription: string;

    /**
     * @hidden
     *
     * @memberof IgxAvatarComponent
     */
    private _size: string | Size = 'small';

    /**
     * Sets the id of the avatar. If not set,the first avatar component will have id = "igx-avatar-0".
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
     *
     * Sets a round shape to the avatar if "roundShape" is true.
     * By default the shape of the avatar is a square.
     *
     * ```html
     * <igx-avatar roundShape = "true" ></igx-avatar>
     * ```
     * @memberof IgxAvatarComponent
     */
    @HostBinding('class.igx-avatar--rounded')
    @Input()
    public roundShape = false;

    /**
     * Sets the avatar's initials/icon color.
     *
     *```html
     *<igx-avatar color="blue"></igx-avatar>
     *```
     *
     * @memberof IgxAvatarComponent
     */
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
    @Input()
    public bgColor: string;

    /**
     *
     * Sets initials to the avatar.
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
     * Sets an icon to the avatar. All icons from the material icon set are supported.
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
     * Sets the image source of the avatar.
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
     *
     * Returns the size of the avatar.
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
     * Sets the size  of the avatar.
     * By default the size is "small". It can be set to "medium" or "large".
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
     *
     * Returns the template corresponding to the avatar type.
     *
     * ```typescript
     * let template = this.avatar.template;
     * ```
     * @memberof IgxAvatarComponent
     */
    get template() {
        if (this.src) {
            return this.imageTemplate;
        }

        if (this.initials) {
            return this.initialsTemplate;
        }

        return this.iconTemplate;

    }

    constructor(public elementRef: ElementRef) { }

    /**
     * @hidden
     *
     * @memberof IgxAvatarComponent
     */
    public ngOnInit() {
        this.roleDescription = this.getRole();
    }

    /**
     *@hidden
     *
     * @memberof IgxAvatarComponent
     */
    public ngAfterViewInit() {
        this.elementRef.nativeElement.classList.add(`igx-avatar--${this._size}`);
    }
    /**
     * @hidden
     * @memberof IgxAvatarComponent
     */
    private getRole() {
        if (this.initials) {
            return 'initials type avatar';
        } else if (this.src) {
            return 'image type avatar';
        } else {
            return 'icon type avatar';
        }
    }

    /**
     * Returns the url of the image.
     *
     * ```typescript
     * duplicateAvatar.src = this.avatar.getSrcUrl();
     * ```
     *
     * @memberof IgxAvatarComponent
     */
    public getSrcUrl() {
        return `url(${this.src})`;
    }
}

@NgModule({
    declarations: [IgxAvatarComponent],
    exports: [IgxAvatarComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxAvatarModule { }
