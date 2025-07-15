import { Component, inject } from '@angular/core';
import { IGX_GRID_DIRECTIVES } from "igniteui-angular"
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-grid',
  imports: [IGX_GRID_DIRECTIVES],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss'
})
export class GridComponent {
  protected columns: any[] = []
  protected data: any[] = [];
  private dataService = inject(DataService);
  constructor() {
    this.data = this.dataService.generateData();
    this.initializeColumns();
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
    const source = this.data;
    if (source.length > 0) {
      this.columns = [];
      Object.keys(source[0]).forEach(x => {
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
