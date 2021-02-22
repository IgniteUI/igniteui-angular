# igx-navbar

**igx-navbar** is position on top and represents current state and enables a user defined action.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navbar)

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
            (action)="navigateBack()">
</igx-navbar>
```

You can set the id of the component by `id="myNavbar"` or will be automatically generated;

You can set the title of the navbar by setting `title="Settings"`;

You can set the action button icon of the navbar by setting `actionButtonIcon="arrow_back"`;

You can set the visible state of the navbar by setting `isActionButtonVisible="true"`;

You can set the action of the navbar button by setting `(action)="executeAction()"`;

## Navbar with custom action icon

The navbar component provides us with the ability to use a template for the action icon instead of the default one. This can be done by simply using the `igx-action-icon` tag.

```html
<igx-navbar title="Settings"
            actionButtonIcon="arrow_back"
            [isActionButtonVisible]="canGoBack()"
            (action)="navigateBack()">
    <igx-action-icon>
        Navigate back:
        <igx-icon>arrow_back</igx-icon>
    </igx-action-icon>
</igx-navbar>
```

If a custom `igx-action-icon` is provided, the default action icon will not be used.
