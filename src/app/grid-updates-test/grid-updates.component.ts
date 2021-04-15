import { Component, OnInit, ViewChild } from '@angular/core';
import { IRowSelectionEventArgs } from 'igniteui-angular';
import { IgxGridComponent } from 'projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { AMINO_DATA } from './aminoData';

@Component({
  selector: 'app-grid-updates',
  styleUrls: ['./grid-updates.component.scss'],
  templateUrl: './grid-updates.component.html'
})
export class GridUpdatesComponent implements OnInit {
  @ViewChild('grid') public grid: IgxGridComponent;
  public data = [...AMINO_DATA];

  public nestedConfigColumns = [
    { field: 'name', header: 'Name' },
    { field: 'abbreviation.long', header: 'Abbr. (long)' },
    { field: 'abbreviation.owner.name', header: 'Abbr. (owner name)' }
  ];

  public counter = 0;
  public selectedItem?: any;
  private _update;
  private itemUpdater: ItemUpdater;

  public ngOnInit(): void {
    this.itemUpdater = new ItemUpdater(this.data[0], item =>
      this.onItemUpdate(item)
    );
  }

  public update(): void {
    this.itemUpdater.update();
  }

  public stop(): void {
    this.itemUpdater.stop();
  }

  public handleRowSelectionChange(args: IRowSelectionEventArgs): void {
    if (!args.newSelection || args.newSelection.length === 0) {
      this.selectedItem = undefined;
    } else {
      const selectedItemId = args.newSelection[0] as number;
      this.selectedItem = this.data.find(d => d.id === selectedItemId);

      // Fix: Make a copy
      //this.selectedItem = this.originalItems.find(d => d === selectedItemId);
    }
  }

  private onItemUpdate(item: any) {
    // update the data record reference
    const itemIndex = this.data.findIndex(d => d.id === item.id);
    this.data[itemIndex] = { ...item };

    // Needed because of OnPush strategy
    this.grid.cdr.markForCheck();
  }
}

class ItemUpdater {
    public counter = 0;
    private _update;

    constructor(private item: any, private cb: (i: any) => void) {}

    public update(): void {
      this._update = setInterval(() => this.updateData(this.counter), 100);
    }

    public stop(): void {
      clearInterval(this._update);
    }

    public updateData(counter: number): void {
      this.counter++;

      // update
      this.item.name = `Alanine ${counter}`;
      this.item.abbreviation.long = `Ala ${counter}`;
      this.item.abbreviation.owner.name = `User ${counter}`;

      this.cb(this.item);
    }
}
