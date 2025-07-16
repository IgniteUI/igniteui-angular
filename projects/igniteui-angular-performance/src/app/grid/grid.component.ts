import { Component, inject, ViewChild } from '@angular/core';
import { IGX_GRID_DIRECTIVES, IgxButtonDirective, IgxGridComponent, SortingDirection } from "igniteui-angular"
import { DataService } from '../services/data.service';
import { PerformanceService } from "../../../../igniteui-angular/src/lib/performance.service"

@Component({
  selector: 'app-grid',
  imports: [IGX_GRID_DIRECTIVES, IgxButtonDirective],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss'
})
export class GridComponent {
  protected columns: any[] = []
  protected data: any[] = [];
  protected performanceDataList: PerformanceEntryList = [];
  private dataService = inject(DataService);
  private performanceService = inject(PerformanceService)
  @ViewChild("grid")
  private grid: IgxGridComponent;

  constructor() {
    this.data = this.dataService.generateData();
    this.initializeColumns();
    this.performanceService.setLogEnabled(true);
  }

  protected measureSorting() {
    const end = this.performanceService.start("sorting");
    this.grid.sort({ fieldName: 'Id', dir: SortingDirection.Desc });
    end();
    this.performanceDataList = this.performanceDataList.filter(item => item.name !== "sorting");
    this.performanceDataList.push(...this.performanceService.getMeasures("sorting"));
  }

  private initializeColumns(): void {
    this.generateColumns();
    this.columns.forEach(c => {
      if (this.isCurrencyColumn(c.field)) {
        c.dataType = 'currency';
      }
      if (this.isDateColumn(c.field)) {
        c.dataType = "date"
      }
    });
  }

  private generateColumns(): void {
    if (this.data.length > 0) {
      this.columns = [];
      Object.keys(this.data[0]).forEach(x => {
        if (x !== "Avatar" && x !== "CountryFlag") {
          this.columns.push({ field: x, header: x, sortable: true });
        }
      });
    }
  }

  private isCurrencyColumn(field: string): boolean {
    return field === 'openPrice' || field === 'price' || field === 'buy' || field === 'sell';
  }

  private isDateColumn(field: string): boolean {
    return field === "Registered" || field === "FirstAppearance" || field === "TrainerRegistration" || field === "CareerStart"
  }

}
