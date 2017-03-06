import { Component, NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { RouterModule, Router } from '@angular/router';

@Component({
    selector: "tabbar-sample",
    moduleId: module.id,
    templateUrl: 'sample.component.html'
})
export class TabBarSampleComponent {

    constructor(private router: Router) { }

    route(event) {
        if (event.panel.index == 2) {
            this.router.navigate(['/tabbar', { outlets: { 'tabPanelOutlet': ['tabbarInnerPath'] } }]);
        }            
    }
}

@Component({
    selector: "custom-content",
    moduleId: module.id,
    templateUrl: 'template.html'
})

export class CustomContentComponent {

}
