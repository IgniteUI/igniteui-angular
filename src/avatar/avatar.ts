import {
    NgModule,
    Directive,
    Component,
    ElementRef,
    Renderer,
    OnInit,
    Input,
    Output,
    ViewChild
} from '@angular/core';
import { CommonModule } from "@angular/common";

@Component({
    selector: 'ig-avatar',
    moduleId: module.id,
    templateUrl: 'avatar.html',
    // host:{

    // },
    styles: [`.rounded {
                border-radius: 50%;
            }`]
})
export class Avatar {
    @ViewChild('image') wrapper: ElementRef;
    @Input() initials: string;
    @Input() source: string;
    @Input() roundShape: string = "false";
    @Input() bgColor: string;
    @Input() width: number = 60;
    @Input() textColor: string = 'white';
    protected fontname = "Titillium Web";

    public get srcImage() {
        return this.wrapper.nativeElement.src;
    }

    public set srcImage(value: string) {
        this.wrapper.nativeElement.src = value;
    }

    private get isRounded() : boolean{
        return this.roundShape.toUpperCase() === "TRUE" ? true : false;
    }

    constructor(public element_ref: ElementRef, private renderer: Renderer) {
        this._addEventListeners(renderer);
    }

    ngAfterViewInit() {
        if(this.initials){
            var src = this.generateCanvas(this.width);
            this.wrapper.nativeElement.src = src;
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
        ctx.fillStyle = this.textColor;
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