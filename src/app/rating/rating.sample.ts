import { Component } from '@angular/core';
import { defineComponents, IgcRatingComponent } from 'igniteui-webcomponents';

defineComponents(IgcRatingComponent);


@Component({
    selector: 'app-rating-sample',
    styleUrls: ['rating.sample.css'],
    templateUrl: 'rating.sample.html'
})
export class RatingSampleComponent {
    public model = {
        Name: 'BMW M3',
        Rating: 5
    };

}
