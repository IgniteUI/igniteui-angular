import { Component } from '@angular/core';

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
