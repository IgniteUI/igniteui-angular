import { AfterViewInit, Component, ElementRef, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { AbsoluteScrollStrategy, AutoPositionStrategy, HorizontalAlignment,
    // tslint:disable-next-line: max-line-length
    IgxOverlayService, IgxToggleDirective, OverlayCancelableEventArgs, VerticalAlignment, OverlayEventArgs, IgxTabsComponent } from 'igniteui-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxChartMenuComponent } from './chart-dialog/chart-dialog.component';
import * as charts from '../../images/charts';
import * as conditions from '../../images/conditions';
import { IgxContextMenuDirective } from './igx-context-menu.directive';
import { CHART_TYPE } from '../directives/chart-integration/chart-types';
@Component({
    selector: 'igx-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss']
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
    private destroy$ = new Subject<any>();
    private _dialogId;
    private _chartDialogOS = { closeOnOutsideClick: false };
    private _tabsMenuOverlaySettings = this.getPositionSettings(HorizontalAlignment.Center, VerticalAlignment.Bottom);
    private _chartPreviewDialogOS = this.getPositionSettings(HorizontalAlignment.Center, VerticalAlignment.Top);
    public chartImages;
    public conditionImages;
    constructor(private overlayService: IgxOverlayService) {
        this.chartImages = charts;
        this.conditionImages = conditions;
     }

    public ngAfterViewInit() {
        this.chartTypes = this.contextDirective.charts;
        this.textFormatters = this.contextDirective.formatters;

        if (this.contextDirective.chartsDirective) {
            this.contextDirective.chartsDirective.onChartTypesDetermined.pipe(takeUntil(this.destroy$))
                .subscribe((args) => this.chartTypes = args.chartsForCreation);
        }

        if (this.contextDirective.textFormatter) {
            this.contextDirective.textFormatter.onFormattersReady.pipe(takeUntil(this.destroy$))
                .subscribe(names => this.textFormatters = names);
        }

        this.contextDirective.onButtonClose.pipe(takeUntil(this.destroy$))
            .subscribe(() => { if (this.tabsMenu && !this.tabsMenu.collapsed) { this.tabsMenu.close(); } });

        this.contextDirective.gridResizeNotify.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                    if (!this.tabsMenu.collapsed) {
                        this.tabsMenu.close();
                    }
            });
        this.tabsMenu.onOpening.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
           if (this.tabs.selectedTabItem.disabled) {
                const i = this.tabs.tabs.find(tab => !tab.disabled)?.index || 0;
                this.tabs.performSelectionChange(this.tabs.tabs.toArray()[i]);
           }
        });

        this.overlayService.onOpening.pipe(takeUntil(this.destroy$))
            .subscribe((args: OverlayCancelableEventArgs) => {
                if (args.componentRef) {
                    const instance = (args.componentRef.instance as IgxChartMenuComponent);
                    instance.width = this.contextDirective.grid.nativeElement.clientWidth;
                    instance.height = this.contextDirective.grid.nativeElement.clientHeight;
                    instance.currentChartType = this.currentChartType;
                    instance.allCharts = this.chartTypes;
                    instance.chartDirective = this.contextDirective.chartsDirective;
                    instance.onClose.subscribe(() => this.closeDialog());
                    instance.chartDialogResizeNotify.subscribe(resizedContentArgs => {
                        // This is a temporary fix, which should be removed right after
                        // the overlay service is capable of notifying the overlay content elements
                        // that their children has been resized.
                        // tslint:disable-next-line: max-line-length
                        (this.overlayService as any)._overlayElement.children[1].children[0].style.width = resizedContentArgs[0].contentRect.width + 'px';
                    });
                }
            });
        this.overlayService.onClosing.pipe(takeUntil(this.destroy$))
        .subscribe((args: OverlayEventArgs) => {
            if (args.componentRef && args.componentRef.instance instanceof IgxChartMenuComponent) {
                this.toggleTabMenu();
                this._dialogId = undefined;
            }
        });
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public toggleTabMenu() {
        this._tabsMenuOverlaySettings.positionStrategy.settings.target = this.button.nativeElement;
        this.tabsMenu.collapsed ? this.tabsMenu.open(this._tabsMenuOverlaySettings) : this.tabsMenu.close();
    }

    public formatCells(condition) {
        this.contextDirective.textFormatter.formatCells(condition);
    }

    public clearFormat() {
        this.contextDirective.textFormatter.clearFormatting();
    }

    public previewChart(currentChartType) {
        this.currentChartType = currentChartType;
        this.chartPreview.clear();
        this.contextDirective.chartsDirective.chartFactory(currentChartType, this.chartPreview);
        this._chartPreviewDialogOS.positionStrategy.settings.target = this.tabsMenu.element;
        this._chartPreviewDialogOS.positionStrategy.settings.openAnimation = null;
        this.chartPreviewDialog.open(this._chartPreviewDialogOS);
    }

    public hidePreview() {
        this.chartPreviewDialog.close();
    }

    public openDialog(type?: CHART_TYPE) {
        this.currentChartType = type ? type : this.currentChartType ? this.currentChartType : CHART_TYPE.COLUMN_GROUPED;
        this._dialogId = this._dialogId ? this._dialogId :
            this.overlayService.attach(IgxChartMenuComponent, this._chartDialogOS);
        this.tabsMenu.close();
        this.overlayService.show(this._dialogId);
    }

    public closeDialog() {
        this.overlayService.hide(this._dialogId);
    }

    private getPositionSettings(horizontal, vertical) {
        return {
            closeOnOutsideClick: false, modal: false,
            scrollStrategy: new AbsoluteScrollStrategy(),
            positionStrategy: new AutoPositionStrategy({
                horizontalDirection: horizontal, horizontalStartPoint: horizontal,
                verticalStartPoint: vertical, verticalDirection: vertical, closeAnimation: null
            })
        };
    }
}
