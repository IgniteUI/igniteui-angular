import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-button-sample',
    styleUrls: ['button.sample.css'],
    templateUrl: 'button.sample.html'
})
export class ButtonSampleComponent implements OnInit {
    public density = 'comfortable';
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
