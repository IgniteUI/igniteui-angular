import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { IGridCellEventArgs, IgxGridComponent } from 'igniteui-angular';

class HeaderInfo {
  constructor(
    public propertyName: string,
    public headerText: string,
    public columnId: string
  ) {}
}

@Component({
  selector: 'app-rowmove',
  templateUrl: './grid-row-move.component.html',
  styleUrls: ['./grid-row-move.component.css'],
})
export class RowmoveComponent implements OnInit {
  @ViewChild('headerGrid')
  private _grid!: IgxGridComponent;

  /**
   * Sets if the Move Up button should be disabled
   */
  isMoveUpButtonDisabled = true;

  /**
   * Sets if the Move Down button should be disabled
   */
  isMoveDownButtonDisabled = true;

  headers = [
    { propertyName: 'item0', headerText: 'Item 0', columnId: '0' },
    { propertyName: 'item1', headerText: 'Item 1', columnId: '1' },
    { propertyName: 'item2', headerText: 'Item 2', columnId: '2' },
    { propertyName: 'item3', headerText: 'Item 3', columnId: '3' },
    { propertyName: 'item4', headerText: 'Item 4', columnId: '4' },
    { propertyName: 'item5', headerText: 'Item 5', columnId: '5' },
    { propertyName: 'item6', headerText: 'Item 6', columnId: '6' },
    { propertyName: 'item7', headerText: 'Item 7', columnId: '7' },
    { propertyName: 'item8', headerText: 'Item 8', columnId: '8' },
    { propertyName: 'item9', headerText: 'Item 9', columnId: '9' },
    { propertyName: 'item10', headerText: 'Item 10', columnId: '10' },
    { propertyName: 'item11', headerText: 'Item 11', columnId: '11' },
    { propertyName: 'item12', headerText: 'Item 12', columnId: '12' },
    { propertyName: 'item13', headerText: 'Item 13', columnId: '13' },
    { propertyName: 'item14', headerText: 'Item 14', columnId: '14' },
    { propertyName: 'item15', headerText: 'Item 15', columnId: '15' },
    { propertyName: 'item16', headerText: 'Item 16', columnId: '16' },
    { propertyName: 'item17', headerText: 'Item 17', columnId: '17' },
    { propertyName: 'item18', headerText: 'Item 18', columnId: '18' },
    { propertyName: 'item19', headerText: 'Item 19', columnId: '19' },
    { propertyName: 'item20', headerText: 'Item 20', columnId: '20' },
    { propertyName: 'item21', headerText: 'Item 21', columnId: '21' },
    { propertyName: 'item22', headerText: 'Item 22', columnId: '22' },
    { propertyName: 'item23', headerText: 'Item 23', columnId: '23' },
    { propertyName: 'item24', headerText: 'Item 24', columnId: '24' },
    { propertyName: 'item25', headerText: 'Item 25', columnId: '25' },
    { propertyName: 'item26', headerText: 'Item 26', columnId: '26' },
    { propertyName: 'item27', headerText: 'Item 27', columnId: '27' },
    { propertyName: 'item28', headerText: 'Item 28', columnId: '28' },
    { propertyName: 'item29', headerText: 'Item 29', columnId: '29' },
  ] as HeaderInfo[];

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  onSelection(event: IGridCellEventArgs): void {
    this._selectionClearAndSelect(event.cell.row.index);
  }

  onMoveUp() {
    if (this._getSelectedIndex() > 0) {
      const newIndexPostion = this._getSelectedIndex() - 1;
      this._moveItem(this._getSelectedIndex(), newIndexPostion);
    } else {
      const newIndexPostion = 0;
      this._moveItem(0, -1);
    }
  }

  onMoveDown() {
    if (
      this._getSelectedIndex() > -1 &&
      this._getSelectedIndex() < this.headers.length
    ) {
      const newIndexPostion = this._getSelectedIndex() + 1;
      this._moveItem(this._getSelectedIndex(), newIndexPostion);
    }
  }

  private _selectionClearAndSelect(index: number) {
    this._grid.clearCellSelection();
    // Helps with visiblity to know which row is selected
    this._grid.setSelection({
      columnStart: 0,
      columnEnd: 0,
      rowStart: index,
      rowEnd: index,
    });
    this._buttonDisabler(this._getSelectedIndex());
  }

  private _getSelectedIndex(): number {
    const selectedData = this._grid.selectionService.selection;
    return selectedData.keys().next().value; // Should only be one selected, getting the first one;
  }

  private _moveItem(from: number, to: number) {
    const temparray = this.headers[from];

    this.headers.splice(from, 1);
    this.headers.splice(to, 0, temparray);
    this.headers = this.headers.slice(0, from);

    this._selectionClearAndSelect(to);
    this._grid.navigateTo(to);
    this._cdr.detectChanges();
  }

  private _buttonDisabler(selectItemIndex: number) {
    if (selectItemIndex > this.headers.length - 1) {
      this.isMoveUpButtonDisabled = true;
      this.isMoveDownButtonDisabled = true;
      return;
    } else if (selectItemIndex === 0) {
      this.isMoveDownButtonDisabled = false;
      this.isMoveUpButtonDisabled = true;
    } else if (selectItemIndex === this.headers.length - 1) {
      this.isMoveDownButtonDisabled = true;
      this.isMoveUpButtonDisabled = false;
    } else {
      this.isMoveDownButtonDisabled = false;
      this.isMoveUpButtonDisabled = false;
    }
  }
}
