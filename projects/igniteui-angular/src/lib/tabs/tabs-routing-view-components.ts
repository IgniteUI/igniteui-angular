import { Component, NgModule } from '@angular/core';

@Component({
    template: `This is a content from view component # 1`
})
export class TabsRoutingView1Component {
}

@Component({
    template: `This is a content from view component # 2`
})
export class TabsRoutingView2Component {
}

@Component({
    template: `This is a content from view component # 3`
})
export class TabsRoutingView3Component {
}

/**
 * @hidden
 */
@NgModule({
    declarations: [TabsRoutingView1Component, TabsRoutingView2Component, TabsRoutingView3Component],
    exports: [TabsRoutingView1Component, TabsRoutingView2Component, TabsRoutingView3Component],
})
export class TabsRoutingViewComponentsModule {
}
