import { Component, OnInit } from '@angular/core';
import { IgxButtonGroupModule } from 'igniteui-angular';

@Component({
    selector: 'size-selector',
    styleUrls: ['size-selector.component.scss'],
    templateUrl: 'size-selector.component.html',
    imports: [
        IgxButtonGroupModule
    ]
})
export class SizeSelectorComponent implements OnInit {

    public size: string = 'large';
    public sizes;

    public ngOnInit(): void {
        this.sizes = [
            { label: 'large', selected: this.size === 'large', togglable: true },
            { label: 'medium', selected: this.size === 'medium', togglable: true },
            { label: 'small', selected: this.size === 'small', togglable: true }
        ];
    }

    public selectSize(event) {
        this.size = this.sizes[event.index].label;
    }
}