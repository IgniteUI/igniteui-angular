import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { TabBarSampleComponent, CustomContentComponent } from "./sample.component";

const tabbarRoutes: Routes = [
    {
        path: 'tabbar',
        component: TabBarSampleComponent,
        children: [
            { path: 'tabbarInnerPath', component: CustomContentComponent, outlet: 'tabPanelOutlet' }
        ]
    }
];

@NgModule({
    imports: [
        IgxComponentsModule,
        IgxDirectivesModule,
        RouterModule.forChild(tabbarRoutes)
    ],
    declarations: [
        TabBarSampleComponent,
        CustomContentComponent
    ]
})
export class TabBarSampleModule { }