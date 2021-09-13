import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { IgxTextAlign } from 'igniteui-angular';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-progressbar-sample',
    styleUrls: ['progressbar.sample.scss'],
    templateUrl: 'progressbar.sample.html'
})

export class ProgressbarSampleComponent {
    public currentValue = 10;
    public max = 100;
    public incrementProgress() {
        this.currentValue += 10;
    }

    public decrementProgress() {
        this.currentValue -= 10;
    }

    public incrementMax() {
        this.max += 10;
    }

    public decrementMax() {
        this.max -= 10;
    }
}
