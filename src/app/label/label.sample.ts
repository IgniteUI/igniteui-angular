import { Component } from '@angular/core';
import {IgxLabelDirective} from "igniteui-angular";

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [IgxLabelDirective],
  templateUrl: './label.sample.html',
  styleUrl: './label.sample.scss'
})
export class LabelSampleComponent {

}
