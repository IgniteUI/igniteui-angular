import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { IgxButtonDirective, IgxCircularProgressBarComponent, IgxIconComponent, IgxLinearProgressBarComponent, IgxProgressBarGradientDirective, IgxProgressBarTextTemplateDirective, IgxRippleDirective, IgxTextAlign } from 'igniteui-angular';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-progressbar-sample',
    styleUrls: ['progressbar.sample.scss'],
    templateUrl: 'progressbar.sample.html',
    imports: [IgxLinearProgressBarComponent, IgxCircularProgressBarComponent, IgxProgressBarTextTemplateDirective, IgxProgressBarGradientDirective, IgxButtonDirective, IgxRippleDirective, IgxIconComponent]
})

export class ProgressbarSampleComponent implements OnInit {
    public positionCenter: IgxTextAlign;
    public positionEnd: IgxTextAlign;
    public currentValue: number;
    public type: string;

    constructor() {
        this.currentValue = 0;
        this.generateNewProgressValues();
    }

    public generateNewProgressValues() {
        const value = this.randomIntFromInterval(this.currentValue, 100);

        this.currentValue = value;
    }

    public randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public ngOnInit() {
        this.positionCenter = IgxTextAlign.CENTER;
        this.positionEnd = IgxTextAlign.END;
    }
}
