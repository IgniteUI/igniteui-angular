import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, Component, DoCheck, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { AbsoluteScrollStrategy, ConnectedPositioningStrategy, DefaultSortingStrategy, GridColumnDataType, IGX_BUTTON_GROUP_DIRECTIVES, IGX_GRID_DIRECTIVES, IgxColumnComponent, IgxGridComponent, IgxIconModule, IgxOverlayOutletDirective, IgxSelectComponent, IgxSelectModule, IgxSwitchModule, OverlaySettings, SortingDirection } from 'igniteui-angular';
import { IgcDockManagerLayout, IgcDockManagerPaneType, IgcSplitPane, IgcSplitPaneOrientation } from 'igniteui-dockmanager';
import { defineCustomElements } from 'igniteui-dockmanager/loader';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalRService } from './signal-r.service';

defineCustomElements();

@Component({
    selector: 'app-dock-slot',
    template: `
    <div style='width: 100%; height: 100%; overflow-x: hidden;'>
        <ng-container #host></ng-container>
    </div>`
})
export class DockSlotComponent implements AfterViewInit, OnDestroy {
    @Output()
    public viewInit = new EventEmitter();

    @ViewChild('host', { read: ViewContainerRef })
    public host: ViewContainerRef;

    @Input()
    @HostBinding('attr.slot')
    public id;

    public destroy$ = new Subject<any>();

    public ngAfterViewInit() {
        this.viewInit.emit();
    }

    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}

@Component({
    encapsulation: ViewEncapsulation.None,
    providers: [],
    selector: 'app-grid-dockmanager-sample',
    styleUrls: ['dockmanager-grid.sample.scss'],
    templateUrl: 'dockmanager-grid.sample.html',
    imports: [
        NgFor,
        CommonModule,
        FormsModule,
        IGX_GRID_DIRECTIVES,
        IGX_BUTTON_GROUP_DIRECTIVES,
        IgxSelectModule,
        IgxSwitchModule,
        IgxIconModule,
        IgxOverlayOutletDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GridDockManagerSampleComponent implements OnInit, OnDestroy, AfterViewInit, DoCheck {
    @ViewChild('grid1', { static: true }) public grid1: IgxGridComponent;
    @ViewChild('grid2', { static: true }) public grid2: IgxGridComponent;
    @ViewChild('host', { read: ViewContainerRef }) public host: ViewContainerRef;
    @ViewChild('dock', { read: ElementRef }) public dockManager: ElementRef<HTMLIgcDockmanagerElement>;
    @ViewChild('priceTemplate', { read: TemplateRef })
    public priceTemplate: TemplateRef<any>;
    @ViewChild(IgxSelectComponent) public select: IgxSelectComponent;
    @ViewChild('freq', { read: IgxSelectComponent }) public selectFrequency: IgxSelectComponent;

    public isDarkTheme = true;

    public frequencyItems: number[] = [300, 600, 900];
    public frequency = this.frequencyItems[1];
    public dataVolumeItems: number[] = [100, 500, 1000, 5000, 10000];
    public dataVolume: number = this.dataVolumeItems[1];
    public isLoading = true;
    public data: any;
    public liveData = true;
    public columnFormat = { digitsInfo: '1.3-3'};
    public columnFormatChangeP = { digitsInfo: '2.3-3'};
    public slotCounter = 1;
    public customOverlaySettings: OverlaySettings = {
        positionStrategy: new ConnectedPositioningStrategy(),
        scrollStrategy: new AbsoluteScrollStrategy()
    };
    public freqOverlaySettings: OverlaySettings = {
        positionStrategy: new ConnectedPositioningStrategy(),
        scrollStrategy: new AbsoluteScrollStrategy()
    };

    public docLayout: IgcDockManagerLayout = {
        rootPane: {
            type: IgcDockManagerPaneType.splitPane,
            orientation: IgcSplitPaneOrientation.horizontal,
            panes: [
                {
                    type: IgcDockManagerPaneType.contentPane,
                    contentId: 'actionPane',
                    header: 'Actions pane',
                    size: 20,
                    isPinned: false,
                    allowClose: false
                },
                {
                    size: 50,
                    type: IgcDockManagerPaneType.contentPane,
                    contentId: 'gridStockPrices',
                    header: 'Stock Market Data',
                    allowClose: false
                },
                {
                    type: IgcDockManagerPaneType.splitPane,
                    orientation: IgcSplitPaneOrientation.vertical,
                    size: 50,
                    panes: [
                        {
                        type: IgcDockManagerPaneType.documentHost,
                        size: 50,
                        rootPane: {
                            type: IgcDockManagerPaneType.splitPane,
                            orientation: IgcSplitPaneOrientation.horizontal,
                            panes: [
                                {
                                    type: IgcDockManagerPaneType.tabGroupPane,
                                    panes: [
                                        {
                                            type: IgcDockManagerPaneType.contentPane,
                                            contentId: 'forexMarket',
                                            header: 'Market Data 1'
                                        },
                                        {
                                            type: IgcDockManagerPaneType.contentPane,
                                            contentId: 'content4',
                                            header: 'Market Data 2'
                                        }
                                    ]
                                }
                            ]
                        }},
                       {
                        type: IgcDockManagerPaneType.contentPane,
                        contentId: 'etfStockPrices',
                        header: 'Market Data 3',
                        size: 50,
                        allowClose: false
                       }
                    ]
                }
            ]
        },
        floatingPanes: []
    };

    public columns: { field: string,
                    width: string,
                    sortable: boolean,
                    filterable: boolean,
                    type: GridColumnDataType,
                    groupable?: boolean,
                    cellClasses?: string,
                    bodyTemplate?: TemplateRef<any> } [] = [
        { field: 'buy', width: '110px', sortable: false, filterable: false, type: 'currency' },
        { field: 'sell', width: '110px', sortable: false, filterable: false, type: 'currency' },
        { field: 'openPrice', width: '120px', sortable: true, filterable: true, type: 'currency'},
        { field: 'lastUpdated', width: '120px', sortable: true, filterable: true, type: 'date'},
        { field: 'spread', width: '110px', sortable: false, filterable: false, type: 'number' },
        { field: 'volume', width: '110px', sortable: true, filterable: false, type: 'number' },
        { field: 'settlement', width: '100px', sortable: true, filterable: true, type: 'string', groupable: true },
        { field: 'country', width: '100px', sortable: true, filterable: true, type: 'string'},
        { field: 'highD', width: '110px', sortable: true, filterable: false, type: 'currency' },
        { field: 'lowD', width: '110px', sortable: true, filterable: false, type: 'currency' },
        { field: 'highY', width: '110px', sortable: true, filterable: false, type: 'currency' },
        { field: 'lowY', width: '110px', sortable: true, filterable: false, type: 'currency' },
        { field: 'startY', width: '110px', sortable: true, filterable: false, type: 'currency' },
        { field: 'indGrou', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'indSect', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'indSubg', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'secType', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'issuerN', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'moodys', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'fitch', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'dbrs', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'collatT', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'curncy', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'security', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'sector', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'cusip', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'ticker', width: '136px', sortable: false, filterable: false, type: 'string'},
        { field: 'cpn', width: '136px', sortable: false, filterable: false, type: 'string'}
    ];

    private destroy$ = new Subject<any>();

    constructor(public dataService: SignalRService, private cdr: ChangeDetectorRef, private elementRef: ElementRef, private renderer:Renderer2) {}

    public ngOnInit() {
        this.dataService.startConnection(this.frequency, this.dataVolume, true, false);
        this.data = this.dataService.data;
        this.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            if (data.length !== 0) {
                this.isLoading = false;
            };
        });
    }

    public ngOnDestroy() {
        this.dataService.stopLiveData();
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public ngDoCheck() {
        if (this.isDarkTheme) {
            this.renderer.removeClass(this.elementRef.nativeElement, 'light-theme');
            this.renderer.addClass(this.elementRef.nativeElement, 'dark-theme');
        } else {
            this.renderer.removeClass(this.elementRef.nativeElement, 'dark-theme');
            this.renderer.addClass(this.elementRef.nativeElement, 'light-theme');
        }
    }

    public ngAfterViewInit() {
        // This 500ms timeout is used as a workaround for StackBlitz ExpressionChangedAfterItHasBeenChecked Error
        setTimeout(() => {
            // this.paneService.initialPanePosition = { x, y };
            this.grid2.selectColumns(['price', 'change', 'changeP']);
            this.customOverlaySettings.target = this.select.inputGroup.element.nativeElement;
            //this.customOverlaySettings.outlet = this.outlet;
            this.freqOverlaySettings.target = this.selectFrequency.inputGroup.element.nativeElement;
            //this.freqOverlaySettings.outlet = this.outlet;
            this.grid1.groupingExpressions = [{
                dir: SortingDirection.Desc,
                fieldName: 'category',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            },
            {
                dir: SortingDirection.Desc,
                fieldName: 'type',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            },
            {
                dir: SortingDirection.Desc,
                fieldName: 'settlement',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            }];
        }, 500);
    }

    public paramsChanged() {
        this.dataService.hasRemoteConnection ? this.dataService.broadcastParams(this.frequency, this.dataVolume, true, false) :
            this.dataService.startConnection(this.frequency, this.dataVolume, true, false);
        this.data = this.dataService.data;
    }

    public stopFeed() {
        this.dataService.stopLiveData();
    }

    public streamData(event) {
        event.checked ? this.paramsChanged() : this.stopFeed();
        this.liveData = event.checked;
    }

    /** Grid CellStyles and CellClasses */
    private negative = (rowData: any): boolean => rowData['changeP'] < 0;
    private positive = (rowData: any): boolean => rowData['changeP'] > 0;
    private changeNegative = (rowData: any): boolean => rowData['changeP'] < 0 && rowData['changeP'] > -1;
    private changePositive = (rowData: any): boolean => rowData['changeP'] > 0 && rowData['changeP'] < 1;
    private strongPositive = (rowData: any): boolean => rowData['changeP'] >= 1;
    private strongNegative = (rowData: any, _key: string): boolean => rowData['changeP'] <= -1;

    public trends = {
        changeNeg: this.changeNegative,
        changePos: this.changePositive,
        negative: this.negative,
        positive: this.positive,
        strongNegative: this.strongNegative,
        strongPositive: this.strongPositive
    };

    public trendsChange = {
        changeNeg2: this.changeNegative,
        changePos2: this.changePositive,
        strongNegative2: this.strongNegative,
        strongPositive2: this.strongPositive
    };

    public createGrid() {
        const id: string = 'slot-' + this.slotCounter++;
        const splitPane: IgcSplitPane = {
            type: IgcDockManagerPaneType.splitPane,
            orientation: IgcSplitPaneOrientation.horizontal,
            floatingWidth: 550,
            floatingHeight: 350,
            panes: [
                {
                    type: IgcDockManagerPaneType.contentPane,
                    header: id,
                    contentId: id
                }
            ]
        };
        this.dockManager.nativeElement.layout.floatingPanes.push(splitPane);
        this.docLayout = { ...this.dockManager.nativeElement.layout };
        this.cdr.detectChanges();

        // Create Dock Slot Component
        const dockSlotComponent = this.host.createComponent(DockSlotComponent);
        dockSlotComponent.instance.id = id;
        dockSlotComponent.instance.viewInit.pipe(first()).subscribe(() => {
            const gridViewContainerRef = dockSlotComponent.instance.host;
            this.loadGridComponent(gridViewContainerRef, dockSlotComponent.instance.destroy$);
        });
    }

    public loadGridComponent(viewContainerRef: ViewContainerRef, destructor: Subject<any>) {
        viewContainerRef.clear();

        const componentRef = viewContainerRef.createComponent(IgxGridComponent);
        const grid = (componentRef.instance as IgxGridComponent);
        grid.autoGenerate = true;
        this.dataService.data.pipe(takeUntil(destructor)).subscribe(d => grid.data = d);
        grid.columnInit.pipe(takeUntil(destructor)).subscribe((col: IgxColumnComponent) => {
            if (col.field === 'price') {
                col.cellClasses = this.trends;
                col.bodyTemplate = this.priceTemplate;
            }
            if (col.field === 'change' || col.field === 'changeP') {
                col.cellClasses = this.trendsChange;
            }
        });
        grid.columnSelection = 'multiple';
        grid.cellSelection = 'none';

        // Use detectChanges because of ExpressionChangedAfterItHasBeenChecked Error when creating a dynamic pane
        this.cdr.detectChanges();
    }


}

