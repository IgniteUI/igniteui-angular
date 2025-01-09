import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { defineComponents, IgcRatingComponent } from 'igniteui-webcomponents';
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardHeaderTitleDirective, IgxCardContentDirective, IgxInputGroupComponent, IgxInputDirective, IgxLabelDirective, IgcFormControlDirective } from 'igniteui-angular';

defineComponents(IgcRatingComponent);


@Component({
    selector: 'app-rating-sample',
    styleUrls: ['rating.sample.scss'],
    templateUrl: 'rating.sample.html',
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
