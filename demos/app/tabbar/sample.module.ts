import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { CustomContentComponent, TabBarSampleComponent } from "./sample.component";
import { IgxTabBarModule, IgxListModule, IgxAvatarModule, IgxIconModule } from "../../lib/main";

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
        PageHeaderModule,
        RouterModule.forChild(tabbarRoutes),
        IgxTabBarModule,
        IgxListModule,
        IgxAvatarModule,
        IgxIconModule
    ]
})
export class TabBarSampleModule { }
