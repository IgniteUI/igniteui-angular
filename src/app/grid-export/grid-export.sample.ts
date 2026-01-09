import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnType, IGridToolbarExportEventArgs, IgxGridComponent } from 'igniteui-angular';
import { CustomGridSummary, HierarchicalGridSummary } from './summaries/grid-summaries';
import { GridDataService } from './services/data.service';
import { IProduct } from './models/grid-models';

@Component({
    selector: 'app-grid-export-sample',
    templateUrl: 'grid-export.sample.html',
    styleUrls: ['./grid-export.sample.scss']
})
export class GridExportComponent implements OnInit {
    @ViewChild('grid', { static: true }) public grid!: IgxGridComponent;

    // Injeção de dependência e tipagem forte
    public gridData: IProduct[] = [];
    public productId: number = 0;
    
    // Referências de classe para o template
    public readonly gridSummary = CustomGridSummary;
    public readonly hGridSummary = HierarchicalGridSummary;

    constructor(private dataService: GridDataService) {}

    public ngOnInit(): void {
        this.loadData();
    }

    private loadData(): void {
        this.gridData = this.dataService.getFlatGridData();
        this.productId = this.gridData.length;
    }

    public toggleSummary(column: ColumnType): void {
        column.hasSummary = !column.hasSummary;
    }

    public configureExport(args: IGridToolbarExportEventArgs): void {
        // Encapsular lógica de exportação em um Helper se ficar muito complexa
        console.log('Exporting with args:', args);
        
        const options = args.options;
        options.fileName = `Report_${new Date().toLocaleDateString()}`;
    }
}