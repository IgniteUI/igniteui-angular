import { Component } from '@angular/core';
import { DisplayDensity } from 'igniteui-angular';

const data = Array.apply(null, { length: 57 }).map((e, i) => {
    return {
        valueKey: i,
        textKey: `Option ${i + 1}`,
        isHeader: i % 7 === 0
    };
});
@Component({
    selector: 'app-display-density',
    templateUrl: 'display-density.sample.html',
    styleUrls: ['display-density.sample.scss']
})
export class DisplayDensityDropDownComponent {
    public data = data;
    public displayDensity = DisplayDensity;
}
