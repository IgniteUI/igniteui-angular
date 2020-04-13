import { AfterViewInit, Component, EventEmitter, HostBinding,
    Output, ViewChild, ViewContainerRef, ViewEncapsulation, ElementRef} from '@angular/core';
import * as charts from '../../../images/charts';
import { Subject } from 'rxjs';
import ResizeObserver from 'resize-observer-polyfill';

@Component({
    selector: 'igx-chart-menu',
    templateUrl: './chart-dialog.component.html',
    styleUrls: ['./chart-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IgxChartMenuComponent implements AfterViewInit {

    @ViewChild('chartArea', { read: ViewContainerRef }) public chartArea: ViewContainerRef;

    @Output()
    public onClose = new EventEmitter<any>();

    @HostBinding('style.width.px')
    public get width() {
        return this.fullScreen ? this._width : 0.7 * this._width;
    }
    public set width(value) {
        this._width = value;
    }

    @HostBinding('style.height.px')
    public get height() {
        return this.fullScreen ? this._height : 0.7 * this._height;
    }
    public set height(value) {
        this._height = value;
    }

    public chartDialogResizeNotify = new Subject();
    private contentObserver: ResizeObserver;
    public images;
    public chartDirective;
    public currentChartType;
    public title;
    public allCharts = [];
    public fullScreen = false;
    public isConfigAreaExpanded = false;
    public mainChartTypes = ['Column', 'Area', 'Bar', 'Line', 'Scatter', 'Pie'];
    private _width;
    private _height;

    constructor(private element: ElementRef<any>) {
        this.images = charts;
    }

    public ngAfterViewInit() {

        this.contentObserver = new ResizeObserver ( (args) => this.chartDialogResizeNotify.next(args));
        this.contentObserver.observe(this.element.nativeElement);

        this.createChart(this.currentChartType);
    }

    public toggleFullScreen() {
        this.fullScreen = !this.fullScreen;
    }

    public hasAvailableChart(chartType) {
        return this.allCharts.some(c => c.includes(chartType));
    }

    public createChart(chartType) {
        this.currentChartType = chartType;
        this.title = chartType.split(/(?=[A-Z])/).toString().replace(',', ' ');
        this.chartArea.clear();
        this.chartDirective.chartFactory(chartType, this.chartArea);
    }
}
