import { CommonModule } from "@angular/common";
import {
    AfterContentChecked,
    AfterViewInit,
    Component,
    ElementRef,
    HostBinding,
    Input,
    NgModule,
    Renderer2,
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
export class IgxAvatarComponent implements AfterViewInit, AfterContentChecked {
    @ViewChild("image") public image: ElementRef;
    @ViewChild("initialsImage") public initialsImage: ElementRef;
    @Input() public initials: string;
    @Input() public src: string;
    @Input("roundShape") public roundShape = "false";
    @Input() public color = "white";

    @HostBinding("attr.aria-label") public ariaLabel = "avatar";
    @HostBinding("attr.role") public role = "img";
    @HostBinding("attr.class")
    public get classes() {
        return "igx-avatar igx-avatar--" + this.size;
    }

    public sizeEnum = Size;
    public roleDescription: string;

    @ViewChild("imageTemplate", { read: TemplateRef }) protected imageTemplate: TemplateRef<any>;
    @ViewChild("initialsTemplate", { read: TemplateRef }) protected initialsTemplate: TemplateRef<any>;
    @ViewChild("iconTemplate", { read: TemplateRef }) protected iconTemplate: TemplateRef<any>;

    private _size: string;
    private _bgColor: string;
    private _icon = "android";
    private _isInitialsRepositionNeeded = false;

    @Input()
    get size(): string {
        if (this._isInitialsRepositionNeeded) {
            this.repositionInitials();
        }

        return this._size === undefined ? "small" : this._size;
    }

    set size(value: string) {
        const sizeType = this.sizeEnum[value.toUpperCase()];
        this._size = sizeType === undefined ? "small" : value.toLowerCase();

        if (this.initials && this.initialsImage) {
            this._isInitialsRepositionNeeded = true;
        }
    }

    @Input()
    get bgColor(): string {
        return this._bgColor;
    }

    set bgColor(value: string) {
        const color = value === "" ? "lightgrey" : value;
        this._bgColor = color;
    }

    public get srcImage() {
        return this.image ? this.image.nativeElement.src : "";
    }

    public set srcImage(value: string) {
        this.image.nativeElement.src = value;
    }

    get isRounded(): boolean {
        return this.roundShape.toUpperCase() === "TRUE" ? true : false;
    }

    get initialsClasses() {
        const isRoundedClass = this.isRounded ? "igx-avatar--rounded" : "";
        return isRoundedClass + " igx-avatar--" + this.size;
    }

    get template() {
        if (this.src) {
            return this.imageTemplate;
        }

        if (this.initials) {
            return this.initialsTemplate;
        }

        return this.iconTemplate;
    }

    @Input()
    public get icon(): string {
        return this._icon;
    }

    public set icon(value: string) {
        this._icon = value;
    }

    constructor(public elementRef: ElementRef, private renderer: Renderer2) {
        this._addEventListeners(renderer);
    }

    public ngAfterViewInit() {
        if (this.initials && this.initialsImage) {
            const svgText = this.initialsImage.nativeElement.children[0];
            if (svgText) {
                svgText.textContent = this.initials.toUpperCase();
            }

            this.repositionInitials();
        }
    }

    public ngAfterContentChecked() {
        this.roleDescription = this.getRole();
    }

    private getRole() {
        if (this.initials) {
            return "initials type avatar";
        } else if (this.src) {
            return "image type avatar";
        } else {
            return "icon type avatar";
        }
    }

    private repositionInitials() {
        // it seems the svg element is not yet fully initialized so give it some time
        setTimeout(() => {
            const svgText = this.initialsImage.nativeElement.children[0];
            if (svgText) {
                const size = parseInt(this.initialsImage.nativeElement.width.baseVal.value, 10);
                const fontSize = size / 2;
                const y = size - size / 2 + fontSize / 3;

                this.renderer.setAttribute(svgText, "font-size", fontSize.toString());
                this.renderer.setAttribute(svgText, "x", fontSize.toString());
                this.renderer.setAttribute(svgText, "y", y.toString());
            }
        }, 50);

        this._isInitialsRepositionNeeded = false;
    }

    private _addEventListeners(renderer: Renderer2) { }
}

@NgModule({
    declarations: [IgxAvatarComponent],
    exports: [IgxAvatarComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxAvatarModule { }
