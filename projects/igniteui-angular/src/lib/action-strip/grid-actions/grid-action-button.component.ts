import { Component, Input, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
@Component({
    selector: 'igx-grid-action-button',
    templateUrl: 'grid-action-button.component.html'
})

export class IgxGridActionButtonComponent {

    @Output()
    onActionClick = new EventEmitter<Event>();

    @ViewChild(TemplateRef)
    public templateRef: TemplateRef<any>;

    @Input()
    public asMenuItem = false;

    @Input()
    public clickHandler;

    @Input()
    public iconName: string;

    @Input()
    public iconSet: string;

    @Input()
    public labelText: string;

    public handleClick(event) {
       this.onActionClick.emit(event);
    }
}
