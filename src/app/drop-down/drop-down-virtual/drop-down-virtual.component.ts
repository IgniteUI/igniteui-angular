import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ISelectionEventArgs, IgxForOfDirective, IgxDropDownComponent } from 'igniteui-angular';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-drop-down-virtual',
  templateUrl: './drop-down-virtual.component.html',
  styleUrls: ['./drop-down-virtual.component.scss']
})
export class DropDownVirtualComponent implements OnInit {
  @ViewChild(IgxDropDownComponent, { read: IgxDropDownComponent})
  public dropdown: IgxDropDownComponent;
  @ViewChild(IgxForOfDirective, { read: IgxForOfDirective})
  public virtScroll: IgxForOfDirective<any>;
  public items: any[];
  public selectedItem: { name: string, id: number };
  public selectedIndex: number;
  constructor(private cdr: ChangeDetectorRef) {
    this.items = Array.apply(null, {length: 2000}).map((e, i) => ({name: `Item ${i + 1}`, id: i}));
  }

  public itemHeight = 48;
  public itemsMaxHeight = 480;

  handleSelection(event: ISelectionEventArgs) {
    this.selectedItem = event.newSelection.value;
    this.selectedIndex = event.newSelection.index;
  }
  ngOnInit() {

  }

  scrollToIndex() {
    const virtDirective = this.dropdown.virtDir;
    const chunkSize = virtDirective.state.chunkSize;
    const targetIndex = this.selectedIndex > chunkSize / 2 ? this.selectedIndex + chunkSize / 2 : this.selectedIndex;
    virtDirective.scrollTo(Math.trunc(targetIndex));
  }
}
