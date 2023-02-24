import { Component } from '@angular/core';
import { defineComponents, IgcRatingComponent } from 'igniteui-webcomponents';
import { IgcFormControlDirective } from '../../../projects/igniteui-angular/src/lib/directives/form-control/form-control.directive';
import { IgxLabelDirective } from '../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { FormsModule } from '@angular/forms';
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardHeaderTitleDirective, IgxCardContentDirective } from '../../../projects/igniteui-angular/src/lib/card/card.component';
import { NgFor } from '@angular/common';

defineComponents(IgcRatingComponent);


@Component({
    selector: 'app-rating-sample',
    styleUrls: ['rating.sample.scss'],
    templateUrl: 'rating.sample.html',
    standalone: true,
    imports: [NgFor, IgxCardComponent, IgxCardHeaderComponent, IgxCardHeaderTitleDirective, IgxCardContentDirective, FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxLabelDirective, IgcFormControlDirective]
})
export class RatingSampleComponent {
    public models = [{
        Name: 'BMW M3',
        Rating: 5
    }, {
        Name: 'Mercedes C 63 AMG',
        Rating: 9
    }, {
        Name: 'Audi RS4',
        Rating: 7
    }, {
        Name: 'BMW M5',
        Rating: 7
    }, {
        Name: 'Mercedes E63 AMG',
        Rating: 10
    }, {
        Name: 'Audi RS6',
        Rating: 8
    }];
}
