import { Component, OnInit } from '@angular/core';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxPaginatorComponent, IgxPaginatorTemplateDirective, IgxPageSizeSelectorComponent } from '../../../projects/igniteui-angular/src/lib/paginator/paginator.component';

@Component({
    selector: 'app-pagination',
    styleUrls: ['./pagination.styles.scss'],
    templateUrl: './pagination.template.html',
    standalone: true,
    imports: [IgxPaginatorComponent, IgxPaginatorTemplateDirective, IgxButtonDirective, IgxPageSizeSelectorComponent, IgxIconComponent]
})
export class PaginationSampleComponent implements OnInit {

    public totalPages: number;
    public totalRecords: number;

    public ngOnInit() {
        this.totalPages = 21;
        this.totalRecords = this.totalPages * 15;
    }

}
