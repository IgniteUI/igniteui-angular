import { Component } from '@angular/core';
import { SAMPLE_DATA } from '../shared/sample-data';

@Component({
    selector: 'app-grid-clipboard-sample',
    templateUrl: './grid-clipboard.sample.html'
})
export class GridClipboardSampleComponent {
    public data: any[];

    public options = {
        enabled: true,
        copyHeaders: true,
        copyFormatters: true,
        separator: '\t'
    };

    constructor() {
        this.data = SAMPLE_DATA.slice(0);
    }

    public formatter = (value: any) => `** ${value} **`;

    public initColumn(column) {
        column.formatter = this.formatter;
        column.header = `🐱‍👤 ${column.field} 🐱‍🏍`;
    }
}
