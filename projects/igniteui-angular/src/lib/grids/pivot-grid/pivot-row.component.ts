import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    forwardRef,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxRowDirective } from '../row.directive';
import { GridBaseAPIService, IgxColumnComponent } from '../hierarchical-grid/public_api';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IPivotDimension } from './pivot-grid.interface';


const MINIMUM_COLUMN_WIDTH = 200;
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row',
    templateUrl: './pivot-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxPivotRowComponent) }]
})
export class IgxPivotRowComponent extends IgxRowDirective<IgxPivotGridComponent> implements OnInit {

    /**
     * @hidden @internal
     */
     @ViewChild('headerTemplate', { read: TemplateRef, static: true })
     public headerTemplate: TemplateRef<any>;

    public rowDimension: IgxColumnComponent[] = [];
    public level = 0;
    public hasChild = false;

    constructor(
        public gridAPI: GridBaseAPIService<IgxPivotGridComponent>,
        public selectionService: IgxGridSelectionService,
        public element: ElementRef<HTMLElement>,
        public cdr: ChangeDetectorRef,
        protected resolver: ComponentFactoryResolver,
        protected viewRef: ViewContainerRef
    ){
        super(gridAPI, selectionService, element, cdr);
    }
    /**
     * @hidden
     * @internal
     */
     public get viewIndex(): number {
        return this.index;
    }

    /**
     * @hidden
     * @internal
     */
    public get rowDimensionKey(){
        return this.rowDimension.map(x => x.header).join('_');
    }

    public get expandState() {
        return this.grid.gridAPI.get_row_expansion_state(this.rowDimensionKey);
    }

    public ngOnInit() {
        // generate rowDimension
        const rowDimConfig = this.grid.pivotConfiguration.rows;
        this.level = this.rowData['level'] || 0;
        this.hasChild = this.rowData['records'] != null && this.rowData['records'].length > 0;
        this.extractFromDimensions(rowDimConfig, 0);
    }

    protected extractFromDimensions(rowDimConfig: IPivotDimension[], level: number){
        for (const dim of rowDimConfig) {
            if  (level === this.level) {
                this.rowDimension.push(this.extractFromDimension(dim));
            } else {
                level++;
                this.extractFromDimensions(dim.childLevels, level);
            }
        }
    }

    protected extractFromDimension(dim: IPivotDimension) {
        let field = null;
        if (typeof dim.member === 'string') {
            field = this.rowData[dim.member];
        } else if (typeof dim.member === 'function'){
            field = dim.member.call(this, this.rowData);
        }
        const col = this._createColComponent(field);
        return col;
    }

    protected _createColComponent(field: string) {
        const factoryColumn = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const ref = this.viewRef.createComponent(factoryColumn, null, this.viewRef.injector);
        ref.instance.field = field;
        ref.instance.header = field;
        ref.instance.width = MINIMUM_COLUMN_WIDTH + 'px';
        (ref as any).instance._vIndex = this.grid.columns.length + this.index;
        ref.instance.headerTemplate = this.headerTemplate;
        return ref.instance;
    }
}

