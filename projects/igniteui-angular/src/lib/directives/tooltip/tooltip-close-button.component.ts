import { Component, Output, EventEmitter } from '@angular/core';
import { IgxIconComponent} from 'igniteui-angular';

@Component({
  selector: 'igx-tooltip-close-button',
  template: `
    <div class="close-button">
        <igx-icon
            name="close"
            ariaLabel="Close tooltip"
            (click)="handleClick()">
        </igx-icon>
    </div>
  `,
  imports: [IgxIconComponent],
})
export class TooltipCloseButtonComponent {
  @Output() public clicked = new EventEmitter<void>();

  public handleClick(): void {
    this.clicked.emit();
  }
}
