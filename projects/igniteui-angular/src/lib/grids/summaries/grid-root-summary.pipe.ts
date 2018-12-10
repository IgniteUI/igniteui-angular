import { Pipe, PipeTransform } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent } from '../grid-base.component';

@Pipe({
    name: 'igxGridSummaryDataPipe',
    pure: true
})
export class IgxSummaryDataPipe implements PipeTransform {

    constructor(private gridAPI: GridBaseAPIService<IgxGridBaseComponent>) { }

    transform(id: string, trigger: boolean = false) {
        const summaryService = this.gridAPI.get(id).summaryService;
        return summaryService.calculateSummaries(
            summaryService.rootSummaryID,
            this.gridAPI.get_summary_data(id)
        );
    }
}
