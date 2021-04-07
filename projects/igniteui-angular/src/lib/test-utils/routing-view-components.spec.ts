import { Component, NgModule } from '@angular/core';

@Component({
    template: `This is a content from view component # 1`
})
export class RoutingView1Component {
}

@Component({
    template: `This is a content from view component # 2`
})
export class RoutingView2Component {
}

@Component({
    template: `This is a content from view component # 3`
})
export class RoutingView3Component {
}

@Component({
    template: `This is a content from view component # 4`
})
export class RoutingView4Component {
}

@Component({
    template: `This is a content from view component # 5`
})
export class RoutingView5Component {
}

/**
 * @hidden
 */
@NgModule({
    declarations: [RoutingView1Component, RoutingView2Component, RoutingView3Component,
        RoutingView4Component, RoutingView5Component],
    exports: [RoutingView1Component, RoutingView2Component, RoutingView3Component,
        RoutingView4Component, RoutingView5Component]
})
export class RoutingViewComponentsModule {
}
