import { Component, Output, EventEmitter, HostListener, Input, TemplateRef } from '@angular/core';
import { IgxIconComponent } from '../../icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'igx-tooltip-close-button',
  template: `
        <ng-container *ngIf="customTemplate; else defaultTemplate">
            <ng-container *ngTemplateOutlet="customTemplate"></ng-container>
        </ng-container>
        <ng-template #defaultTemplate>
            <igx-icon aria-hidden="true" family="default" name="close"></igx-icon>
        </ng-template>
  `,
  imports: [IgxIconComponent, CommonModule],
})
export class IgxTooltipCloseButtonComponent {
    @Input()
    public customTemplate: TemplateRef<any>;

    @Output()
    public clicked = new EventEmitter<void>();

    @HostListener('click')
    public handleClick() {
        this.clicked.emit();
    }
}
