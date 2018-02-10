import { CommonModule } from "@angular/common";
import {
    AfterContentChecked,
    Component,
    ElementRef,
    HostBinding,
    Input,
    NgModule,
    TemplateRef,
    ViewChild
} from "@angular/core";
import { IgxIconModule } from "../icon/icon.component";

export enum Size {
    SMALL,
    MEDIUM,
    LARGE
}

@Component({
    selector: "igx-avatar",
    templateUrl: "avatar.component.html"
})
export class IgxAvatarComponent implements AfterContentChecked {
    @ViewChild("image") public image: ElementRef;
    @ViewChild("initialsImage") public initialsImage: ElementRef;
    @ViewChild("imageTemplate", { read: TemplateRef }) protected imageTemplate: TemplateRef<any>;
    @ViewChild("initialsTemplate", { read: TemplateRef }) protected initialsTemplate: TemplateRef<any>;
    @ViewChild("iconTemplate", { read: TemplateRef }) protected iconTemplate: TemplateRef<any>;

    @HostBinding("attr.aria-label") public ariaLabel = "avatar";
    @HostBinding("attr.role") public role = "img";
    @HostBinding("attr.class")
    public get classes() {
        if (this.isRounded) {
            return `igx-avatar--rounded igx-avatar--${this.size}`;
        }
        return `igx-avatar igx-avatar--${this.size}`;
    }

    public sizeEnum = Size;
    public roleDescription: string;
    private _size: string;
    private _bgColor: string;
    private _icon: string;
    private _initials: string;
    private _src: string;

    @Input("roundShape") public roundShape = "false";
    @Input() public color = "";

    @Input()
    get size(): string {
        return this._size === undefined ? "small" : this._size;
    }

    set size(value: string) {
        const sizeType = this.sizeEnum[value.toUpperCase()];
        this._size = sizeType === undefined ? "small" : value.toLowerCase();
    }

    @Input()
    get bgColor(): string {
        return this._bgColor;
    }

    set bgColor(value: string) {
        const color = value === "" ? "lightgrey" : value;
        this._bgColor = color;
    }

    get isRounded(): boolean {
        return this.roundShape.toUpperCase() === "TRUE" ? true : false;
    }

    get template() {
        if (this._src) {
            return this.imageTemplate;
        }

        if (this._initials) {
            return this.initialsTemplate;
        }

        return this.iconTemplate;
    }

    @Input() public get initials(): string {
        return this._initials;
    }

    public set initials(value: string) {
        this._initials = value;
    }

    @Input() public get icon(): string {
        return this._icon;
    }

    public set icon(value: string) {
        this._icon = value;
    }

    @Input() public get src(): string {
        return this._src;
    }

    public set src(value: string) {
        this._src = value;
    }

    constructor(public elementRef: ElementRef) { }

    public ngAfterContentChecked() {
        this.roleDescription = this.getRole();
    }

    private getRole() {
        if (this._initials) {
            return "initials type avatar";
        } else if (this._src) {
            return "image type avatar";
        } else {
            return "icon type avatar";
        }
    }
}

@NgModule({
    declarations: [IgxAvatarComponent],
    exports: [IgxAvatarComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxAvatarModule { }
