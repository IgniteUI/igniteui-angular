import { Component } from '@angular/core';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    selector: 'app-grid-clipboard-sample',
    templateUrl: './grid-clipboard.sample.html'
})
export class GridClipboardSampleComponent {

    data: any[];

    options = {
        enabled: true,
        copyHeaders: true,
        separator: '\t'
    };

    constructor() {
        this.data = SAMPLE_DATA.slice(0);
    }
}
