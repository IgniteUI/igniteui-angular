import { Component, NgModule } from '@angular/core';

@Component({
    template: `
        This is content coming from view # 1
    `
})
export class TabsRoutingView1Component {
}

@Component({
    template: `
        This is content coming from view # 2
    `
})
export class TabsRoutingView2Component {
}

@Component({
    template: `
        This is content coming from view # 3
    `
})
export class TabsRoutingView3Component {
}

/**
 * @hidden
 */
@NgModule({
    declarations: [TabsRoutingView1Component, TabsRoutingView2Component, TabsRoutingView3Component],
    exports: [TabsRoutingView1Component, TabsRoutingView2Component, TabsRoutingView3Component],
    imports: []
})
export class TabsRoutingViewsModule {
}
