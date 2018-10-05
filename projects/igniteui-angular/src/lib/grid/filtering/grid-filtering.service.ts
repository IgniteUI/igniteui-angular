import { Injectable} from '@angular/core';
import { IgxGridAPIService } from '../api.service';
import { IgxIconService } from '../../icon/icon.service';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IgxOverlayOutletDirective } from '../../directives/toggle/toggle.directive';
import { IgxGridComponent } from '../grid.component';
import { FilterIcons } from './svgIcons';

const FILTERING_ICONS_FONT_SET = 'filtering-icons';

/**
 *@hidden
 */
@Injectable()
export class IgxFilteringService {

    public gridId: string;
    public isFilterRowVisible = false;
    public filteredColumn = null;
    public selectedExpression = null;
    public columsWithComplexFilter = [];

    constructor (private gridAPI: IgxGridAPIService, private iconService: IgxIconService) {
    }

    get grid(): IgxGridComponent {
        return this.gridAPI.get(this.gridId);
    }

    get gridOutlet(): IgxOverlayOutletDirective {
        return this.grid.outletDirective;
    }

    public filter(field: string, expressionsTree: FilteringExpressionsTree): void {
        this.grid.filter(field, null, expressionsTree);
    }

    public clearFilter(field: string): void {
        this.grid.clearFilter(field);
    }

    public registerSVGIcons(): void {
        if (this.iconService.isSvgIconCached('contains', FILTERING_ICONS_FONT_SET) === false) {
        this.iconService.addSvgIcon('contains', FilterIcons.Contains, FILTERING_ICONS_FONT_SET);
        // iconsService.addSvgIcon('doesNotContain', '../../../src/assets/svg/filtering/does_not_contain.svg', fontSet);
        // iconsService.addSvgIcon('doesNotEqual', '../../../src/assets/svg/filtering/does_not_equal.svg', fontSet);
        // iconsService.addSvgIcon('endsWith', '../../../src/assets/svg/filtering/ends_with.svg', fontSet);
        // iconsService.addSvgIcon('equals', '../../../src/assets/svg/filtering/equals.svg', fontSet);
        // iconsService.addSvgIcon('isEmpty', '../../../src/assets/svg/filtering/is_empty.svg', fontSet);
        // iconsService.addSvgIcon('startsWith', '../../src/assets/svg/filtering/starts_with.svg', fontSet);
        }
    }

}
