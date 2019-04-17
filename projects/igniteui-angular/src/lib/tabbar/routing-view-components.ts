import { Component, NgModule } from '@angular/core';

@Component({
    template: `This is content in component # 1`
})
export class RoutingView1Component {
}

@Component({
    template: `This is content in component # 2`
})
export class RoutingView2Component {
}

@Component({
    template: `This is content in component # 3`
})
export class RoutingView3Component {
}

/**
 * @hidden
 */
@NgModule({
    declarations: [RoutingView1Component, RoutingView2Component, RoutingView3Component],
    exports: [RoutingView1Component, RoutingView2Component, RoutingView3Component],
    // imports: [CommonModule, IgxBadgeModule, IgxIconModule]
})
export class RoutingViewComponentsModule {
}
