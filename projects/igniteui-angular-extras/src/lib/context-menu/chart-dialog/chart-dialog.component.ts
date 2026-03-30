import {
    AfterViewInit,
    Component,
    EventEmitter,
    HostBinding,
    OnDestroy,
    Output,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
    ElementRef,
    CUSTOM_ELEMENTS_SCHEMA,
    inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as charts from '../../../images/charts';
import { Subject } from 'rxjs';
import { IgxIconComponent } from 'igniteui-angular/icon';
import {
    IgxIconButtonDirective,
    IgxRippleDirective,
    IgxDividerComponent
} from 'igniteui-angular/directives';
import { SvgPipe } from '../../pipes/svg.pipe';

@Component({
    selector: 'igx-chart-menu',
    templateUrl: './chart-dialog.component.html',
    styleUrls: ['./chart-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, IgxIconComponent, IgxIconButtonDirective, IgxRippleDirective, IgxDividerComponent, SvgPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgxChartMenuComponent implements AfterViewInit, OnDestroy {

    @ViewChild('chartArea', { read: ViewContainerRef }) public chartArea: ViewContainerRef;

    @Output()
    public closed = new EventEmitter<any>();

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
    private element = inject(ElementRef<any>);

    constructor() {
        this.images = charts;
    }

    public ngAfterViewInit() {
        this.contentObserver = new ResizeObserver((args) => this.chartDialogResizeNotify.next(args));
        this.contentObserver.observe(this.element.nativeElement);

        if (this.currentChartType && this.chartDirective) {
            this.createChart(this.currentChartType);
        }
    }

    public ngOnDestroy() {
        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }
        this.chartDialogResizeNotify.complete();
    }

    public toggleFullScreen() {
        this.fullScreen = !this.fullScreen;
    }

    public hasAvailableChart(chartType) {
        return this.allCharts.some(c => c.includes(chartType));
    }

    public createChart(chartType) {
        if (!chartType || !this.chartDirective || !this.chartArea) {
            return;
        }
        this.currentChartType = chartType;
        this.title = chartType.split(/(?=[A-Z])/).toString().replace(',', ' ');
        this.chartArea.clear();
        this.chartDirective.chartFactory(chartType, this.chartArea);
    }
}
