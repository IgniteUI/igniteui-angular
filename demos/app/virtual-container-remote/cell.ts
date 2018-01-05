import { Component, Input } from '@angular/core';
import {VirtualHorizontalItemComponent} from "../../lib/main";

@Component({
  selector: "cell",
  template: `
    <td class='cell' [style.width.px]='width'>{{data}}</td>
  `,
  styleUrls: ['./cell.css']
})
export class myCell implements VirtualHorizontalItemComponent {
@Input() data: any;
@Input() width: any;
}
