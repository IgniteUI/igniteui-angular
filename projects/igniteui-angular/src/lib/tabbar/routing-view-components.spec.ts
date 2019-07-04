import { Component, NgModule } from '@angular/core';

@Component({
    template: `This is a content from view component # 1`
})
export class BottomNavRoutingView1Component {
}

@Component({
    template: `This is a content from view component # 2`
})
export class BottomNavRoutingView2Component {
}

@Component({
    template: `This is a content from view component # 3`
})
export class BottomNavRoutingView3Component {
}

/**
 * @hidden
 */
@NgModule({
    declarations: [BottomNavRoutingView1Component, BottomNavRoutingView2Component, BottomNavRoutingView3Component],
    exports: [BottomNavRoutingView1Component, BottomNavRoutingView2Component, BottomNavRoutingView3Component],
})
export class BottomNavRoutingViewComponentsModule {
}
