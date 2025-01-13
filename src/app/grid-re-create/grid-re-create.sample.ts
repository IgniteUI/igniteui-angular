import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IgxColumnComponent, IgxGridComponent } from 'igniteui-angular';


@Component({
    selector: 'app-grid-sample',
    styleUrls: ['grid-re-create.sample.scss'],
    templateUrl: 'grid-re-create.sample.html',
    standalone: true,
    providers: [
    ],
    imports: [NgIf, IgxGridComponent, IgxColumnComponent]
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
