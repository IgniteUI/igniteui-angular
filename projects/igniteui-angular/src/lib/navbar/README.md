# igx-navbar

**igx-navbar** is position on top and represents current state and enables a user defined action.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navbar.html)

# Usage

## Simple Navbar

```html
<igx-navbar title="Settings">
</igx-navbar>
```

You can be more descriptive and set title `title="User settings"`.


## Navbar with back button

```html
<igx-navbar title="Settings"
            actionButtonIcon="arrow_back"
            [isActionButtonVisible]="canGoBack()"
            (onAction)="navigateBack()">
</igx-navbar>
```

You can set the id of the component by `id="myNavbar"` or will be automatically generated;

You can set the title of the navbar by setting `title="Settings"`;

You can set the action button icon of the navbar by setting `actionButtonIcon="arrow_back"`;

You can set the visible state of the navbar by setting `isActionButtonVisible="true"`;

You can set the action of the navbar button by setting `(onAction)="executeAction()"`;
