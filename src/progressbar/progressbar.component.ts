import {
    NgModule,
    Component,
    Input,
    ElementRef,
    AfterViewInit,
    ViewChild,
    Renderer,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'ig-progressbar',
    template: `
        <div *ngIf="!circeler" class="progress-linear"
            [class.progress-animated]="animated"
            [class.progress-striped]="striped">
            <div class="progress-bar progress-bar{{type ? '-' + type : ''}}"
                aria-valuemin="0"
                [attr.aria-valuemax]="max"
                [attr.aria-valuenow]="getValue()"
                [style.width.%]="getPercentValue()">
                <ng-content></ng-content>
            </div>
        </div>
        <div *ngIf="circeler" class="progress-circeler">
            <canvas #canvas
                    class="progress-bar"
                    [width]="width"
                    [height]="height"
                    aria-valuemin="0"
                    [attr.aria-valuemax]="max"
                    [attr.aria-valuenow]="getValue()"></canvas>
        </div>
    `,
    styleUrls: [ 'stylesheet.css' ]
})
export class IgProgressBar implements AfterViewInit, OnChanges {
    @ViewChild('canvas') _canvas: ElementRef;

    @Input() max: number = 100;
    @Input() animated: boolean = false;
    @Input() striped: boolean = false;
    @Input() type: string = 'default';
    @Input() circeler: boolean = false;
    @Input() value = 0;
    @Input() width = 240;
    @Input() height = 240;

    constructor(private elementRef: ElementRef){
    }

    ngOnChanges(changes: SimpleChanges) {
        if(this._canvas) {
            var ctx =  this._canvas.nativeElement.getContext('2d');

            if(changes.value) {
                ctx.clearRect(0, 0, this.width, this.height);
                this.draw(ctx, this.getPercentValue());
            }
        }
    }

    ngAfterViewInit() {
        if(this._canvas) {
            this.renderCircelerProgressBar(this._canvas);
        }
    }

    public getValue() {
        return getValueInRange(this.value, this.max);
    }

    public getPercentValue() {
        return 100 * this.getValue() / this.max;
    }

    private renderCircelerProgressBar(elementRef: ElementRef) {
        var el = elementRef.nativeElement;
		var ctx = el.getContext('2d');

		ctx.beginPath();
		ctx.strokeStyle = '#337ab7';
		ctx.lineCap = 'square';
		ctx.closePath();
		ctx.fill();
		ctx.lineWidth = 10.0;

		var imd = ctx.getImageData(0, 0, 240, 240);
        ctx.putImageData(imd, 0, 0);

        this.draw(ctx, this.getPercentValue());

        ctx.stroke();
    }

    private draw(ctx:CanvasRenderingContext2D, percentValue:number) {
        ctx.beginPath();
        // ctx.translate(150,150);
        ctx.arc(120, 120, 70, -(Math.PI / 2), ((Math.PI * 2) * percentValue / 100) - Math.PI / 2, false);
        ctx.stroke();
    }

}

export function getValueInRange(value: number, max: number, min = 0): number {
    return Math.max(Math.min(value, max), min);
}

@NgModule({
    imports: [ CommonModule],
    declarations: [IgProgressBar],
    exports: [IgProgressBar]
})
export class IgProgressBarModule {
}