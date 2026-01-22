import { Injectable } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular';
import { Product } from './product.model';

@Injectable()
export class GridFacade {
  private grid!: IgxGridComponent;

  public register(grid: IgxGridComponent) {
    this.grid = grid;
  }

  public addRow(row: Product) {
    this.grid.addRow(row);
  }

  public deleteRow(id: number) {
    this.grid.deleteRow(id);
  }

  public updateCell(value: unknown, row: number, field: string) {
    this.grid.updateCell(value, row, field);
  }
}
