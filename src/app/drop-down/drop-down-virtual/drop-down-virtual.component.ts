import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-drop-down-virtual',
  templateUrl: './drop-down-virtual.component.html',
  styleUrls: ['./drop-down-virtual.component.scss']
})
export class DropDownVirtualComponent implements OnInit {
  public items: any[];
  constructor() {
    this.items = Array.apply(null, {length: 2000}).map((e, i) => ({name: `Item ${i + 1}`, id: i, header: (i % 7 === 0),
    height: (i % 7 === 0) ? 32 : 48}));
  }

  public itemHeight = 48;
  public itemsMaxHeight = 480;

  ngOnInit() {

  }
}
