import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DisplayDensity } from 'igniteui-angular';

@Component({
    selector: 'app-button-sample',
    styleUrls: ['button.sample.css'],
    templateUrl: 'button.sample.html',
    encapsulation: ViewEncapsulation.None
})
export class ButtonSampleComponent implements OnInit {
    public density: DisplayDensity = 'comfortable';
    public displayDensities;

    public ngOnInit(): void {
        this.displayDensities = [
            { label: 'comfortable', selected: this.density === 'comfortable', togglable: true },
            { label: 'cosy', selected: this.density === 'cosy', togglable: true },
            { label: 'compact', selected: this.density === 'compact', togglable: true }
        ];
    }

    public selectDensity(event) {
        this.density = this.displayDensities[event.index].label;
    }
}
