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
            }
            `]
})
export class Avatar {
    @ViewChild('image') wrapper: ElementRef;
    @Input() initials: string;
    @Input() source: string;
    @Input() roundShape: string = "false";
    @Input() cornerRadius: string;
    @Input() bgColor: string;
    @Input() elementWidth: number = 60;
    @Input() textColor: string = 'white';
    public imageSource: string = '';

    get srcImage() {
        return this.wrapper.nativeElement.src;
    }

    set srcImage(value: string) {
        this.wrapper.nativeElement.src = value;
    }

    get isRounded() : boolean{
        return this.roundShape.toUpperCase() === "TRUE" ? true : false;
    }

    constructor(public element_ref: ElementRef, private renderer: Renderer) {
        this._addEventListeners(renderer);
    }

    ngAfterViewInit() {
        if(this.cornerRadius){
            this.wrapper.nativeElement.style.borderRadius = this.cornerRadius;
        }

        if(this.initials){
            var src = this.generateAvatar(this.elementWidth);
            this.wrapper.nativeElement.src = src;
        }
    }

    generateAvatar(size){
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        var fontSize = size / 2;

        var ctx = canvas.getContext('2d');
        ctx.fillStyle = this.bgColor;

        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.fillStyle = this.textColor;
        ctx.font = fontSize + "px monospace";
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