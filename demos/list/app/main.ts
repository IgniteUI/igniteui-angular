import {Component, ViewChild} from '@angular/core';
import * as Infragistics from '../../../src/main';

@Component({
    selector: 'sample-app',
    styleUrls: ["app/main.css"],
    templateUrl: "app/main.html",
    directives: [
        //Infragistics.Button,
        //Infragistics.Icon,
        Infragistics.Header,
        Infragistics.Item,
        Infragistics.List
    ]
})

export class AppComponent {
    navItems: Array<Object> = [
    { text: "Nav1", link: "#" }, 
    { text: "Nav2", link: "#" }, 
    { text: "Nav3", link: "#" }, 
    { text: "Nav4", link: "#" }
        ];

    /*options: Array<Object> = [{
        name: "delete",
        icon: "ig-delete",
        label: "Delete",
        position: "left",
        handler: function() {
            console.log("delete");
        }
    }, 
    {
        name: "recycle",
        icon: "ig-recycle",
        label: "Recycle",
        position: "left",
        handler: function() {
            console.log("recycle");
        }
    }, 
    {
        name: "eat",
        icon: "ig-eat",
        label: "eat",
        position: "right",
        handler: function() {
            console.log("eat");
        }
    }];

    removeItem(index) {
        let newNavItems: Array<Object> = this.navItems.filter((v, i) => i !== index);
        this.navItems = newNavItems;
    }

    recycle(index) {
        alert("recycle " + index);
    }

    eat(index) {
        alert("eat " + index);
    }*/
}