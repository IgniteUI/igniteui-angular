import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'app-tabs-routing-sample',
    styleUrls: ['tabs-routing.sample.css'],
    templateUrl: 'tabs-routing.sample.html'
})
export class TabsRoutingSampleComponent {

    constructor(private router: Router) {
    }

    public navigateUrl1() {
        this.router.navigateByUrl('/tabs-routing/view1');
    }

    public navigateUrl2() {
        this.router.navigateByUrl('/tabs-routing/view2');
    }

    public navigateUrl3() {
        this.router.navigateByUrl('/tabs-routing/view3');
    }

}
