import { AfterViewInit, Component, ElementRef, ViewChild, ViewContainerRef, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    IgxBarSeriesModule, IgxCategoryChartModule, IgxCategoryXAxisModule,
    IgxDataChartCategoryModule, IgxDataChartCoreModule,
    IgxDataChartInteractivityModule, IgxDataChartScatterModule, IgxDataChartStackedModule,
    IgxItemLegendModule, IgxLegendModule,
    IgxNumericXAxisModule, IgxNumericYAxisModule
} from 'igniteui-angular-charts';

import { AutoPositionStrategy, CloseScrollStrategy, HorizontalAlignment, IgxOverlayService, OverlayCancelableEventArgs, OverlayEventArgs, OverlaySettings, VerticalAlignment } from 'igniteui-angular/core';
import { IgxIconButtonDirective, IgxToggleDirective } from 'igniteui-angular/directives';
import { IgxTabContentComponent, IgxTabHeaderComponent, IgxTabHeaderLabelDirective, IgxTabItemComponent, IgxTabsComponent } from 'igniteui-angular/tabs';
import { IgxIconComponent } from 'igniteui-angular/icon';

import { IgxContextMenuDirective } from './igx-context-menu.directive';
import { IgxChartMenuComponent } from './chart-dialog/chart-dialog.component';
import { SvgPipe } from '../pipes/svg.pipe';
import * as charts from '../../images/charts';
import * as conditions from '../../images/conditions';
import { CHART_TYPE } from '../directives/chart-integration/chart-types';

@Component({
    selector: 'igx-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss'],
    imports: [
        CommonModule,
        SvgPipe,
        IgxToggleDirective,
        IgxIconComponent,
        IgxTabsComponent,
        IgxTabItemComponent,
        IgxTabHeaderComponent,
        IgxTabContentComponent,
        IgxTabHeaderLabelDirective,
        IgxBarSeriesModule,
        IgxCategoryChartModule,
        IgxCategoryXAxisModule,
        IgxDataChartCategoryModule,
        IgxDataChartCoreModule,
        IgxDataChartInteractivityModule,
        IgxDataChartScatterModule,
        IgxDataChartStackedModule,
        IgxItemLegendModule,
        IgxLegendModule,
        IgxNumericXAxisModule,
        IgxNumericYAxisModule,
        IgxIconButtonDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgxContextMenuComponent implements AfterViewInit, OnDestroy {
    @ViewChild('analyticsBtn') public button: ElementRef;
    @ViewChild('tabsMenu', { read: IgxToggleDirective }) public tabsMenu: IgxToggleDirective;
    @ViewChild('chartPreview', { read: ViewContainerRef }) public chartPreview: ViewContainerRef;
    @ViewChild('chartPreviewDialog', { read: IgxToggleDirective }) public chartPreviewDialog: IgxToggleDirective;
    @ViewChild(IgxTabsComponent) public tabs: IgxTabsComponent;

    public contextDirective: IgxContextMenuDirective;
    public chartTypes = [];
    public textFormatters = [];
    public currentChartType;
    public currentFormatter;
    public displayCreationTab = true;
    private destroy$ = new Subject<any>();
    private _dialogId;
    private _chartDialogOS: OverlaySettings = { closeOnOutsideClick: false };

    private _tabsMenuOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: false,
        modal: false,
        outlet: null,
        scrollStrategy: new CloseScrollStrategy(),
        positionStrategy: new AutoPositionStrategy({
            horizontalDirection: HorizontalAlignment.Center,
            horizontalStartPoint: HorizontalAlignment.Center,
            verticalStartPoint: VerticalAlignment.Bottom,
            verticalDirection: VerticalAlignment.Bottom,
            openAnimation: null,
            closeAnimation: null,
        }),
    };

    private _chartPreviewDialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: false,
        modal: false,
        outlet: null,
        scrollStrategy: new CloseScrollStrategy(),
        positionStrategy: new AutoPositionStrategy({
            horizontalDirection: HorizontalAlignment.Center,
            horizontalStartPoint: HorizontalAlignment.Center,
            verticalStartPoint: VerticalAlignment.Top,
            verticalDirection: VerticalAlignment.Top,
            openAnimation: null,
            closeAnimation: null,
        }),
    };

    public chartImages;
    public conditionImages;
    private overlayService = inject(IgxOverlayService);

    constructor() {
        this.chartImages = charts;
        this.conditionImages = conditions;
    }

    public ngAfterViewInit() {
        this.chartTypes = this.contextDirective.charts;
        this.textFormatters = this.contextDirective.formatters;
        this.displayCreationTab = this.contextDirective.displayCreationTab;

        if (this.contextDirective.chartsDirective) {
            this.contextDirective.chartsDirective.chartTypesDetermined.pipe(takeUntil(this.destroy$))
                .subscribe((args) => (this.chartTypes = args.chartsForCreation));
        }

        if (this.contextDirective.textFormatter) {
            this.contextDirective.textFormatter.formattersReady.pipe(takeUntil(this.destroy$))
                .subscribe((names) => (this.textFormatters = names));
        }

        this.contextDirective.buttonClose.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.tabsMenu && !this.tabsMenu.collapsed) {
                    this.tabsMenu.close();
                }
            });

        this.contextDirective.gridResizeNotify.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (!this.tabsMenu.collapsed) {
                    this.tabsMenu.close();
                }
            });

        this.overlayService.opening.pipe(takeUntil(this.destroy$))
            .subscribe((args: OverlayCancelableEventArgs) => {
                if (args.componentRef) {
                    const instance = args.componentRef.instance as IgxChartMenuComponent;
                    instance.width = this.contextDirective.grid.nativeElement.clientWidth;
                    instance.height = this.contextDirective.grid.nativeElement.clientHeight;
                    instance.currentChartType = this.currentChartType;
                    instance.allCharts = this.chartTypes;
                    instance.chartDirective = this.contextDirective.chartsDirective;
                    // TODO: This code handles resizing for a fullscreen dialog when the chart dialog resize event is triggered.  
                    // Currently, it determines the visible child element by filtering based on visibility and CSS classes,  
                    // which is not a reliable or optimal approach. Instead, this should be improved by properly handling  
                    // when elements in the overlay are detached and ensuring chart dialog is only available. 
                    instance.chartDialogResizeNotify?.subscribe(resizedContentArgs => {
                        if ((this.overlayService as any)._overlayElement) {
                            const overlayElement = (this.overlayService as any)._overlayElement;
                            const visibleChild = Array.from(overlayElement.children).find(
                                (child: HTMLElement) =>
                                    getComputedStyle(child).visibility !== 'hidden' &&
                                    child.classList.contains('igx-overlay__wrapper--flex')
                            ) as HTMLElement | null;
                            if (visibleChild) {
                                const targetElement = visibleChild.children[0] as HTMLElement | null;
                                if (targetElement && targetElement.style) {
                                    targetElement.style.width = resizedContentArgs[0].contentRect.width + 'px';
                                }
                            }
                        }
                    });
                    instance.closed?.subscribe(() => this.closeDialog());
                }
            });

        this.overlayService.closing.pipe(takeUntil(this.destroy$))
            .subscribe((args: OverlayEventArgs) => {
                if (args.componentRef && args.componentRef.instance instanceof IgxChartMenuComponent) {
                    if (this._dialogId) {
                        this.tabsMenu.open(this._tabsMenuOverlaySettings);
                    }
                }
            });
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public toggleTabMenu() {
        this.currentChartType = this.currentChartType || CHART_TYPE.ColumnGrouped;
        this._tabsMenuOverlaySettings.target = this.button.nativeElement;
        if (this.tabsMenu.collapsed) {
            this.tabsMenu.open(this._tabsMenuOverlaySettings);
        } else {
            this.tabsMenu.close();
        }
    }

    public formatCells(condition) {
        this.currentFormatter = condition;
        this.contextDirective.textFormatter.formatCells(condition);
    }

    public clearFormat() {
        this.contextDirective.textFormatter.clearFormatting();
        this.currentFormatter = undefined;
    }

    public previewChart(currentChartType) {
        this.currentChartType = currentChartType;
        this.chartPreview.clear();
        this.contextDirective.chartsDirective.chartFactory(currentChartType, this.chartPreview);
        this._chartPreviewDialogOverlaySettings.target = this.tabsMenu.element;
        this.chartPreviewDialog.open(this._chartPreviewDialogOverlaySettings);
    }

    public hidePreview() {
        this.chartPreviewDialog.close();
    }

    public openDialog(type?: CHART_TYPE) {
        this.currentChartType =
            type || this.currentChartType || CHART_TYPE.ColumnGrouped;
        this._dialogId = this._dialogId || this.overlayService.attach(IgxChartMenuComponent, this._chartDialogOS);
        this.tabsMenu.close();
        this.overlayService.show(this._dialogId);
    }

    public closeDialog() {
        const info = this.overlayService.getOverlayById(this._dialogId);
        if (info) {
            this.overlayService.hide(this._dialogId);
            this.overlayService.detach(this._dialogId);
            this._dialogId = undefined;
        }
    }
}
