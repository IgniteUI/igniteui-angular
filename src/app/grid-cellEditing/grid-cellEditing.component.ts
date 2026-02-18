import { Component, HostBinding, ViewChild } from '@angular/core';
import { IgxGridComponent, GridSelectionMode } from 'igniteui-angular';
import { Product } from './product.model';
import { GridConfig } from './grid-config.model';
import { GridFacade } from './grid.facade';
import { data, dataWithoutPK } from '../shared/data';
import { EarliestSummary } from './earliest.summary';

@Component({
  selector: 'app-grid-cellediting',
  templateUrl: 'grid-cellEditing.component.html',
  styleUrl: 'grid-cellEditing.component.scss',
  providers: [GridFacade]
})
export class GridCellEditingComponent {

  @ViewChild('grid1', { static: true })
  private gridWithPK!: IgxGridComponent;

  @HostBinding('style.--ig-size')
  protected get sizeStyle() {
    return `var(--ig-size-${this.config.size})`;
  }


  public data: Product[] = data;
  public dataWithoutPK: Product[] = dataWithoutPK;


  public config: GridConfig = {
    selectionMode: 'multiple',
    size: 'small',
    exitEditOnBlur: false
  };

  public earliest = EarliestSummary;

  constructor(private gridFacade: GridFacade) {}

  public ngAfterViewInit() {
    // ✅ EPC reduzido → facade controla grid
    this.gridFacade.register(this.gridWithPK);
  }

  public addRow() {
    this.gridFacade.addRow({
      ProductID: 21,
      ProductName: 'Sir Rodneys Marmalade',
      SupplierID: 8,
      CategoryID: 3,
      UnitsInStock: 999,
      UnitsOnOrder: 0,
      ReorderLevel: 0,
      Discontinued: false,
      OrderDate: new Date('1905-03-17')
    });
  }

  public deleteRow(event: Event, rowID: number) {
    event.stopPropagation();
    this.gridFacade.deleteRow(rowID);
  }

  public updateCell() {
    this.gridFacade.updateCell('Updated', 1, 'ProductName');
  }

  public selectDensity(index: number) {
    const sizes: GridConfig['size'][] = ['large', 'medium', 'small'];
    this.config = { ...this.config, size: sizes[index] };
  }
}
