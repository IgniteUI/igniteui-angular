import { Component } from '@angular/core';

@Component({
    selector: 'app-bottomnav-routing-sample',
    styleUrls: ['bottomnav-routing.sample.css'],
    templateUrl: 'bottomnav-routing.sample.html'
})
export class BottomNavRoutingSampleComponent {
}

@Component({
    selector: 'app-bottomnav-routing-view1-sample',
    template: `This is content in component # 1`
})
export class RoutingView1Component {
}

@Component({
    selector: 'app-bottomnav-routing-view2-sample',
    template: `This is content in component # 2`
})
export class RoutingView2Component {
}

@Component({
    selector: 'app-bottomnav-routing-view3-sample',
    template: `This is content in component # 3`
})
export class RoutingView3Component {
}
