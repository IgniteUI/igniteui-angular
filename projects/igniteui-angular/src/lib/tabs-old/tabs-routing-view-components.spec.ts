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

@Component({
    template: `This is a content from view component # 4`
})
export class TabsRoutingView4Component {
}

@Component({
    template: `This is a content from view component # 5`
})
export class TabsRoutingView5Component {
}

/**
 * @hidden
 */
@NgModule({
    declarations: [TabsRoutingView1Component, TabsRoutingView2Component, TabsRoutingView3Component,
        TabsRoutingView4Component, TabsRoutingView5Component],
    exports: [TabsRoutingView1Component, TabsRoutingView2Component, TabsRoutingView3Component,
        TabsRoutingView4Component, TabsRoutingView5Component]
})
export class TabsRoutingViewComponentsModule {
}
