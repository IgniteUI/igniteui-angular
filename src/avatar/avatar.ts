import {
    NgModule,
    Directive,
    Component,
    ElementRef,
    Renderer,
    OnInit,
    Input,
    Output,
    ViewChild,
    HostBinding
} from '@angular/core';
import { CommonModule } from "@angular/common";

export enum Size { SMALL, MEDIUM, LARGE };

@Component({
    selector: 'ig-avatar',
    moduleId: module.id,
    templateUrl: 'avatar.html',
    // host:{
    //     '[class]': '"ig-avatar--" + _size'
    // },
    styles: [`
            .rounded {
                border-radius: 50%;
            }
            .ig-avatar--small {
                width: 45px;
                height: 45px;
            }
            .ig-avatar--medium {
                width: 60px;
                height: 60px;
            }
            .ig-avatar--large {
                width: 75px;
                height: 75px;
            }
            .ig-avatar--empty{
                text-align:center;
                background-color: lightgray;
                vertical-align: middle;
            }
            `]
})
export class Avatar {
    @ViewChild('image') image: ElementRef;

    @Input() initials: string;
    @Input() src: string;
    @Input() roundShape: string = "false";
    @Input() color: string = 'white';
    protected fontname = "Titillium Web";
    private _size: string;
    private _bgColor: string;
    public SizeEnum = Size;

    get size() : string{
        return this._size === undefined ? "small" : this._size;
    }

    @Input("size")
    set size(value: string){
        var sizeType = this.SizeEnum[value.toUpperCase()];

        if(sizeType === undefined){
            this._size = "small";
        } else {
            this._size = value;
        }
    }

    get bgColor(): string {
        return this._bgColor;
    }

    @Input("bgColor")
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

    get isRounded() : boolean {
        return this.roundShape.toUpperCase() === "TRUE" ? true : false;
    }

    constructor(public element_ref: ElementRef, private renderer: Renderer) {
        this._addEventListeners(renderer);
    }

    ngAfterViewInit() {
        if(this.initials && this.image){
            var src = this.generateCanvas(parseInt(this.image.nativeElement.width));
            this.image.nativeElement.src = src;
        }
    }

    private generateCanvas(size){
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        var fontSize = size / 2;

        var ctx = canvas.getContext('2d');
        ctx.fillStyle = this.bgColor;

        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.fillStyle = this.color;
        ctx.font = fontSize + `px ${this.fontname}`;
        ctx.shadowColor = "black";
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.shadowBlur = 4;
        ctx.fillText(this.initials.toUpperCase(), size / 2,
            size - (size / 2) + (fontSize / 3));

        return canvas.toDataURL("image/png");
    }

    private _addEventListeners(renderer: Renderer) {

    }
}

@NgModule({
    declarations: [Avatar],
    imports: [CommonModule],
    exports: [Avatar]
})
export class AvatarModule {
}