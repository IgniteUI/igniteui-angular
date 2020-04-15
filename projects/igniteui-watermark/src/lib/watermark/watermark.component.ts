import { Component, NgModule, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'igx-watermark',
  styleUrls: ['./watermark.component.scss'],
  templateUrl: './watermark.component.html' ,
})
export class IgxWatermarkComponent {

  @Input()
  public textMessage = 'Text message';

  constructor() {
  }
}

@NgModule({
  declarations: [IgxWatermarkComponent],
  exports: [IgxWatermarkComponent],
  imports: [CommonModule],
})
export class IgxWatermarkModule {}
