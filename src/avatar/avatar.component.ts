import { CommonModule } from "@angular/common";
import {
    AfterContentChecked,
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    NgModule,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { IgxIconModule } from "../icon/icon.component";

export enum Size {
    SMALL,
    MEDIUM,
    LARGE
}

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "igx-avatar",
    styleUrls: ["./avatar.component.scss"],
    templateUrl: "avatar.component.html"
})
export class IgxAvatarComponent implements AfterViewInit, AfterContentChecked {
    @ViewChild("image") public image: ElementRef;
    @ViewChild("initialsImage") public initialsImage: ElementRef;
    @Input() public initials: string;
    @Input() public src: string;
    @Input("roundShape") public roundShape = "false";
    @Input() public color = "white";

    public sizeEnum = Size;
    public roleDescription: string;

    protected fontName = "Titillium Web";

    private _size: string;
    private _bgColor: string;
    private _icon = "android";

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

    public get srcImage() {
        return this.image ? this.image.nativeElement.src : "";
    }

    public set srcImage(value: string) {
        this.image.nativeElement.src = value;
    }

    get isRounded(): boolean {
        return this.roundShape.toUpperCase() === "TRUE" ? true : false;
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
            // it seems the svg element is not yet fully initialized so give it some time
            setTimeout(() => {
                const size = parseInt(this.initialsImage.nativeElement.width.baseVal.value, 10);
                this.generateInitials(size);
            }, 50);
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

    private generateInitials(size) {
        const fontSize = size / 2;

        const svg = this.initialsImage.nativeElement;
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);

        const svgText = svg.children[0];
        if (svgText) {
            svgText.textContent = this.initials.toUpperCase();
            svgText.setAttribute("font-size", fontSize);
            svgText.setAttribute("font-family", this.fontName);

            const x = fontSize;
            svgText.setAttribute("x", x);
            const y = size - size / 2 + fontSize / 3;
            svgText.setAttribute("y", y);
        }
    }

    private _addEventListeners(renderer: Renderer2) { }
}

@NgModule({
    declarations: [IgxAvatarComponent],
    exports: [IgxAvatarComponent],
    imports: [CommonModule, IgxIconModule]
})
export class IgxAvatarModule { }
