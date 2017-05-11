import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { CustomContentComponent, TabBarSampleComponent } from "./sample.component";

const tabbarRoutes: Routes = [
    {
        path: "tabbar",
        component: TabBarSampleComponent,
        children: [
            { path: "tabbarInnerPath", component: CustomContentComponent, outlet: "tabPanelOutlet" }
        ]
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
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
