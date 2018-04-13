import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { CustomContentComponent, TabsSampleComponent } from "./sample.component";
import { IgxTabsModule, IgxListModule, IgxAvatarModule, IgxIconModule, IgxNavbarModule } from "../../lib/main";

const tabbarRoutes: Routes = [
    {
        children: [
            { path: "tabbarInnerPath", component: CustomContentComponent, outlet: "tabPanelOutlet" }
        ],
        component: TabsSampleComponent,
        path: "tabs"
    }
];

@NgModule({
    declarations: [
        TabsSampleComponent,
        CustomContentComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        PageHeaderModule,
        RouterModule.forChild(tabbarRoutes),
        IgxTabsModule,
        IgxListModule,
        IgxAvatarModule,
        IgxIconModule,
        IgxNavbarModule
    ]
})
export class TabsSampleModule { }
