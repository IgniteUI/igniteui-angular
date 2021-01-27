import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-page-header',
    styleUrls: ['./pageHeading.styles.scss'],
    templateUrl: './pageHeading.template.html'
})
export class PageHeaderComponent {
    @Input()
    public title: string;
}
