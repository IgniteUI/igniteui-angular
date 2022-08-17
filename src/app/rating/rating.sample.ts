import { Component } from '@angular/core';
import { defineComponents, IgcRatingComponent } from 'igniteui-webcomponents';

defineComponents(IgcRatingComponent);


@Component({
    selector: 'app-rating-sample',
    styleUrls: ['rating.sample.scss'],
    templateUrl: 'rating.sample.html'
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
