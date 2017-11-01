import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { IgxComponentsModule, IgxDirectivesModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { CustomContentComponent, TabBarSampleComponent } from "./sample.component";

const tabbarRoutes: Routes = [
    {
        children: [
            { path: "tabbarInnerPath", component: CustomContentComponent, outlet: "tabPanelOutlet" }
        ],
        component: TabBarSampleComponent,
        path: "tabbar"
    }
];

@NgModule({
    declarations: [
        TabBarSampleComponent,
        CustomContentComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IgxComponentsModule,
        IgxDirectivesModule,
        PageHeaderModule,
        RouterModule.forChild(tabbarRoutes)
    ]
})
export class TabBarSampleModule { }
