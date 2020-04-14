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

@Component({
    template: `This is a content from view component # 4`
})
export class BottomNavRoutingView4Component {
}

@Component({
    template: `This is a content from view component # 5`
})
export class BottomNavRoutingView5Component {
}

/**
 * @hidden
 */
@NgModule({
    declarations: [BottomNavRoutingView1Component, BottomNavRoutingView2Component, BottomNavRoutingView3Component,
        BottomNavRoutingView4Component, BottomNavRoutingView5Component],
    exports: [BottomNavRoutingView1Component, BottomNavRoutingView2Component, BottomNavRoutingView3Component,
        BottomNavRoutingView4Component, BottomNavRoutingView5Component]
})
export class BottomNavRoutingViewComponentsModule {
}
