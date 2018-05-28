import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-page-header',
    styleUrls: ['./pageHeading.styles.css'],
    templateUrl: './pageHeading.template.html'
})
export class PageHeaderComponent {

    @Input()
    title: string;
}
