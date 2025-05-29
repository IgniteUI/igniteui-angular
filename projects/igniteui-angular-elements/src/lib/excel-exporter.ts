import { IgxExcelExporterOptions, IgxExcelExporterService } from 'igniteui-angular';
import { IgcNgElement } from '../app/custom-strategy';

export class IgcExcelExporterService extends IgxExcelExporterService {
    public override export(grid: any, options: IgxExcelExporterOptions): void {
        const elementGrid = grid as IgcNgElement;
        const gridRef = (elementGrid.ngElementStrategy as any)?.componentRef?.instance;
        super.export(gridRef, options);
    }
}
