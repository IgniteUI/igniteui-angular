import { Inject, Pipe, PipeTransform } from '@angular/core';
import { GridType, IGX_GRID_BASE } from '../common/grid.interface';

@Pipe({
    name: 'igxGridSummaryDataPipe',
    standalone: true
})
export class IgxSummaryDataPipe implements PipeTransform {

    constructor(@Inject(IGX_GRID_BASE) private grid: GridType) { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public transform(id: string, trigger = 0) {
        const summaryService = this.grid.summaryService;
        return summaryService.calculateSummaries(
            summaryService.rootSummaryID,
            this.grid.gridAPI.get_summary_data()
        );
    }
}
