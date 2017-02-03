# ig-nav-drawer

The **ig-nav-drawer** is a container element for side navigation, providing quick access between views. It can be used for navigation apps and with top-level views. Drawer will be hidden until invoked by the user.

# Usage
```html
<ig-nav-drawer id="test"
    (opened)="logEvent($event)"
    [position]="position"
    [pin]="pin"
    [enableGestures]='gestures'
    [isOpen]="open"
    [width]="drawerWidth"
    [miniWidth]="drawerMiniWidth">
        <div class="ig-drawer-content">
            <h3>Drawer Title</h3>
            <div *ngFor="let navItem of navItems"><img src="http://www.infragistics.com/assets/images/favicon.ico" width='16' />
            <a routerLink="{{navItem.link}}"> {{navItem.text}} </a></div>
        </div>
        <div *ngIf="miniTemplate" class="ig-drawer-mini-content">
            <span class="hamburger" igxNavToggle="test" > &#9776; </span>
            <div *ngFor="let navItem of navItems"><img src="http://www.infragistics.com/assets/images/favicon.ico" width='16' /></div>
        </div>
</ig-nav-drawer>
```

# API Summary

## Properties
| Name      | Type|  Description |
|:----------|:----:|:------|
| `ID`| string | ID of the component. |
| `position` | string | Position of the Navigation Drawer. Can be "left"(default) or "right". Only has effect when not pinned.|
| `enableGestures`| boolean | Enables the use of touch gestures to manipulate the drawer - such as swipe/pan from edge to open, swipe toggle and pan drag. |
| `isOpen` | boolean | State of the drawer. |
| `pin` | boolean | Pinned state of the drawer. Currently only support. |
| `pinThreshold` | number | Minimum device width required for automatic pin to be toggled. Deafult is 1024, can be set to falsy value to ignore. |
| `width` | string| Width of the drawer in its open state. Defaults to 300px based on the `.ig-nav-drawer` style. Can be used to override or dynamically modify the width.|
| `miniWidth` | string | Width of the drawer in its mini state. Defaults to 60px based on the `.ig-nav-drawer.mini` style. Can be used to override or dynamically modify the width. |

## Methods
| Name      |  Description |
|:----------|:------|
| `open`    | Open the Navigation Drawer. Has no effect if already opened. *@param* fireEvents Optional flag determining whether events should be fired or not. *@return* Promise that is resolved once the operation completes. |
| `close`   | Close the Navigation Drawer. Has no effect if already closed. *@param* fireEvents Optional flag determining whether events should be fired or not. *@return* Promise that is resolved once the operation completes. |
| `expectedWidth()`  | Get the Drawer width for specific state. Will attempt to evaluate requested state and cache. |
| `expectedMiniWidth()`| Get the Drawer mini width for specific state. Will attempt to evaluate requested state and cache. |

## Events
| Name      |  Description |
|:----------|:------|
| `opening` | Event fired as the Navigation Drawer is about to open. |
| `opened`  | Event fired when the Navigation Drawer has opened. |
| `closing` | Event fired as the Navigation Drawer is about to close. |
| `closed`  | Event fired when the Navigation Drawer has closed. |

Using `TypeScript` to configure Drawer component

```typescript
export class MainDrawerSampleComponent {
    navItems: Array<Object> =
                [{ text: "Default sample", link: "/navigation-drawer" },
                    { text: "Pin sample", link: "/navigation-drawer/pin" },
                    { text: "Mini sample", link: "/navigation-drawer/mini" }];

    pin: boolean = false;
    open: boolean = false;
    position = "left";
    drawerMiniWidth = "";
    @ViewChild(NavigationDrawer) viewChild: NavigationDrawer;
    /** Sample-specific configurations: */
    showMiniWidth: boolean = false;
    showEventLog: boolean = true;
    showToggle: boolean = true;

    logEvent(event) {
        if(event === "closing") {
            // this will cause change detection, potentially run outside of angular
            this.open = false;
        }
    }
    testToggle () {
        this.viewChild.toggle().then( (value) => {
            this.logEvent("API call resolved: " + value);
        });
    }
}
```
