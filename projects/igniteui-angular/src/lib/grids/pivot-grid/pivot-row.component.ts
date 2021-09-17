import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    forwardRef,
    OnInit,
    ViewContainerRef
} from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxRowDirective } from '../row.directive';
import { GridBaseAPIService, IgxColumnComponent } from '../hierarchical-grid/public_api';
import { IgxGridSelectionService } from '../selection/selection.service';


const MINIMUM_COLUMN_WIDTH = 136;
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row',
    templateUrl: './pivot-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxPivotRowComponent) }]
})
export class IgxPivotRowComponent extends IgxRowDirective<IgxPivotGridComponent> implements OnInit {


    public rowDimension: IgxColumnComponent[] = [];

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

    public ngOnInit() {
        // generate rowDimension
        const rowDimConfig = this.grid.pivotConfiguration.rows;
        let field = null;
        for (const dim of rowDimConfig) {
            if (typeof dim.member === 'string') {
                field = this.rowData[dim.member];
            } else if (typeof dim.member === 'function'){
                field = dim.member.call(this, this.rowData);
            }
            const col = this._createColComponent(field);
            this.rowDimension.push(col);
        }
    }

    protected _createColComponent(field: string) {
        const factoryColumn = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const ref = this.viewRef.createComponent(factoryColumn, null, this.viewRef.injector);
        ref.instance.field = field;
        ref.instance.width = MINIMUM_COLUMN_WIDTH + 'px';
        (ref as any).instance._vIndex = this.grid.columns.length + this.index;
        return ref.instance;
    }
}

