import { Injectable } from '@angular/core';
import { IgxGridAPIService } from '../api.service';
import { IgxIconService } from '../../icon/icon.service';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IgxGridComponent } from '../grid.component';
import icons from './svgIcons';
import { IFilteringExpression } from '../../data-operations/filtering-expression.interface';

const FILTERING_ICONS_FONT_SET = 'filtering-icons';

/**
 *@hidden
 */
@Injectable()
export class IgxFilteringService {

    public gridId: string;
    public isFilterRowVisible = false;
    public filteredColumn = null;
    public selectedExpression: IFilteringExpression = null;
    public columsWithComplexFilter = [];

    constructor(private gridAPI: IgxGridAPIService, private iconService: IgxIconService) {
    }

    get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridId);
    }

    public filter(field: string, expressionsTree: FilteringExpressionsTree): void {
        this.grid.filter(field, null, expressionsTree);
    }

    public clearFilter(field: string): void {
        this.grid.clearFilter(field);
    }

    public registerSVGIcons(): void {
        for (const icon of icons) {
            if (!this.iconService.isSvgIconCached(icon.name, FILTERING_ICONS_FONT_SET)) {
                this.iconService.addSvgIconFromText(icon.name, icon.value, FILTERING_ICONS_FONT_SET);
            }
        }
    }
}
