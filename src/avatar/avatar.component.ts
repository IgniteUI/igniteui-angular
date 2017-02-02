import { NgModule, Directive, Component, ElementRef, Renderer,
    OnInit, Input, Output, ViewChild, HostBinding
} from '@angular/core';
import { CommonModule } from "@angular/common";

export enum Size { SMALL, MEDIUM, LARGE };

@Component({
    selector: 'igx-avatar',
    moduleId: module.id,
    templateUrl: 'avatar.component.html'
})
export class IgxAvatar {
    @ViewChild('image') image: ElementRef;
    @Input() initials: string;
    @Input() src: string;
    @Input("roundShape") roundShape: string = "false";
    @Input() color: string = 'white';

    protected fontname = "Titillium Web";
    private _size: string;
    private _bgColor: string;
    private _icon: string = "android";
    public SizeEnum = Size;
    public roleDescription: string;

    @Input()
    get size(): string {
        return this._size === undefined ? "small" : this._size;
    }


    set size(value: string) {
        var sizeType = this.SizeEnum[value.toUpperCase()];

        if (sizeType === undefined) {
            this._size = "small";
        } else {
            this._size = value.toLowerCase();
        }
    }

    @Input()
    get bgColor(): string {
        return this._bgColor;
    }


    set bgColor(value: string) {
        var color = value === "" ? "lightgrey" : value;
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

    constructor(public element_ref: ElementRef, private renderer: Renderer) {
        this._addEventListeners(renderer);
    }

    ngAfterViewInit() {
        if (this.initials && this.image) {
            var src = this.generateInitials(parseInt(this.image.nativeElement.width));
            this.image.nativeElement.src = src;
        }
    }

    ngAfterContentChecked(){
        this.roleDescription = this.getRole();
    }

    private getRole() {
        if (this.initials){
            return "initials type avatar";
        } else if (this.src){
            return "image type avatar";
        } else {
            return "icon type avatar";
        }
    }

    private generateInitials(size) {
        var canvas = document.createElement('canvas'),
            fontSize = size / 2, ctx;

        canvas.width = size;
        canvas.height = size;

        ctx = canvas.getContext('2d');
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.fillStyle = this.color;
        ctx.font = fontSize + `px ${this.fontname}`;
        ctx.fillText(this.initials.toUpperCase(), size / 2,
            size - (size / 2) + (fontSize / 3));

        return canvas.toDataURL("image/png");
    }

    private _addEventListeners(renderer: Renderer) {

    }
}

@NgModule({
    declarations: [IgxAvatar],
    imports: [CommonModule],
    exports: [IgxAvatar]
})
export class IgxAvatarModule {
}