import {
    ChangeDetectorRef,
    Component,
    Input,
    TemplateRef,
    ViewChild,
    HostBinding,
    AfterViewInit,
    ElementRef,
    HostListener,
    OnInit,
    ChangeDetectionStrategy,
    DoCheck
} from '@angular/core';
import { IgxColumnComponent } from '../grid';
import { IgxDropDownComponent } from '../../drop-down';
import { HorizontalAlignment, VerticalAlignment, ConnectedPositioningStrategy, CloseScrollStrategy, OverlaySettings } from '../../services';
import { IgxButtonGroupComponent } from '../../buttonGroup/buttonGroup.component';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-excel-style-filtering',
    templateUrl: './grid.excel-style-filtering.component.html'
})
export class IgxGridExcelStyleFilteringComponent implements AfterViewInit {

    private _column: IgxColumnComponent;

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom
    };
    
    private _overlaySettings: OverlaySettings = {
      closeOnOutsideClick: true,
      modal: false,
      positionStrategy: new ConnectedPositioningStrategy(this._positionSettings),
      scrollStrategy: new CloseScrollStrategy()
    };

    public isSortedAsc = false;
    public isSortedDesc = false;

    @Input()
    get column(): IgxColumnComponent {
        return this._column;
    }

    set column(val) {
        if (val) {
            this._column = val;
        }
    }

    constructor() {
    }

    ngAfterViewInit(): void {
        this._overlaySettings.outlet = this.column.grid.outletDirective;
    }

    public onIconClick(eventArgs) {
        this._overlaySettings.positionStrategy.settings.target = eventArgs.target;
        this.dropdown.toggle(this._overlaySettings);
        const se = this.column.grid.sortingExpressions.find(expr=>expr.fieldName === this.column.field);
        if(se) {
            if(se.dir === 1) {
                this.sortButtonGroup.selectButton(0);
            } else {
                this.sortButtonGroup.selectButton(1);
            }
        }
    }

    public onSortButtonClicked(sortDirection) {
        if (this.sortButtonGroup.selectedIndexes.length === 0) {
            this.column.grid.clearSort(this.column.field);
        } else {
            this.column.gridAPI.sort(this.column.gridID, { fieldName: this.column.field, dir: sortDirection, ignoreCase: true },)
        }
    }

    public onPin() {
        this.column.pinned = !this.column.pinned;
        this.dropdown.close();
    }

    @ViewChild(IgxDropDownComponent) 
    public dropdown: IgxDropDownComponent;

    @ViewChild('sortButtonGroup') 
    public sortButtonGroup: IgxButtonGroupComponent;

    @ViewChild('ascButton') 
    public ascButton: ElementRef;

    @ViewChild('descButtonGroup') 
    public descButton: ElementRef;

}