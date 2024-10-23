import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  IgxAvatarComponent, IgxColumnComponent, IgxGridComponent, IgxIconComponent, IgxListComponent, IgxListItemComponent, IgxPageNavigationComponent, IgxPageSizeSelectorComponent, IgxPaginatorComponent, IgxPaginatorContentDirective } from 'igniteui-angular';


@Component({
    selector: 'app-grid-sample',
    styleUrls: ['grid-re-create.sample.scss'],
    templateUrl: 'grid-re-create.sample.html',
    standalone: true,
    providers: [
    ],
    imports: [NgIf, NgFor, IgxGridComponent, IgxColumnComponent,IgxListComponent, IgxListItemComponent, IgxAvatarComponent, IgxIconComponent,
         IgxPaginatorComponent, IgxPaginatorContentDirective, IgxPageSizeSelectorComponent,  IgxPageNavigationComponent]
})
export class GridRecreateSampleComponent implements OnInit {
    public data = [] as any[];
    public create = false;

    public ngOnInit(): void {
      new Array(100).fill({}).forEach((_, i) => {
        this.data.push({
          id: i,
          columnA: `A ${i}`,
          columnB: `B ${i}`,
        });
      });
    }

}
