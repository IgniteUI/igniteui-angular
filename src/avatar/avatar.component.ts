import { CommonModule } from "@angular/common";
import {
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
    moduleId: module.id,
    selector: "igx-avatar",
    styleUrls: ["./avatar.component.css"],
    templateUrl: "avatar.component.html"
})
export class IgxAvatar {
    @ViewChild("image") public image: ElementRef;
    @Input() public initials: string;
    @Input() public src: string;
    @Input("roundShape") public roundShape: string = "false";
    @Input() public color: string = "white";

    public sizeEnum = Size;
    public roleDescription: string;

    protected fontname = "Titillium Web";

    private _size: string;
    private _bgColor: string;
    private _icon: string = "android";

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
        if (this.initials && this.image) {
            const src = this.generateInitials(
                parseInt(this.image.nativeElement.width, 10)
            );
            this.image.nativeElement.src = src;
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
        const canvas = document.createElement("canvas");
        const fontSize = size / 2;
        let ctx;

        canvas.width = size;
        canvas.height = size;

        ctx = canvas.getContext("2d");
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.fillStyle = this.color;
        ctx.font = fontSize + `px ${this.fontname}`;
        ctx.fillText(
            this.initials.toUpperCase(),
            size / 2,
            size - size / 2 + fontSize / 3
        );

        return canvas.toDataURL("image/png");
    }

    private _addEventListeners(renderer: Renderer2) { }
}

@NgModule({
    declarations: [IgxAvatar],
    exports: [IgxAvatar],
    imports: [CommonModule, IgxIconModule]
})
export class IgxAvatarModule { }
