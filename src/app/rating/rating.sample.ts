import { Component, ViewChild, AfterContentInit } from '@angular/core';
import { IgxRadioGroupDirective, RadioGroupAlignment } from 'igniteui-angular';
import { FormGroup, FormBuilder } from '@angular/forms';

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
