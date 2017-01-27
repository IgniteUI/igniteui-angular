igx-navbar
----------

**igx-navbar** is position on top and represents current state and enables a user defined action.

#Usage

##Simple Navbar

```html
<igx-navbar title="Settings">
</igx-navbar>
```

You can be more descriptive and set title `title="User settings"`.


##Navbar with back button

```html
<igx-navbar title="Settings"
            actionButtonIcon="arrow_back"
            [isActionButtonVisible]="canGoBack()"
            (onAction)="navigateBack()">
</igx-navbar>
```

You can set the title of the navbar by setting `title="Settings"`;

You can set the action button icon of the navbar by setting `actionButtonIcon="arrow_back"`;

You can set the visible state of the navbar by setting `isActionButtonVisible="true"`;

You can set the action of the navbar button by setting `(onAction)="executeAction()"`;
