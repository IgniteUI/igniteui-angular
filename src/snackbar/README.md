ig-snackbar
--------------------

**ig-snackbar** provides feedback about an operation by showing brief message at the bottom of the screen on mobile and lower left on larger devices. IgxSnackbar will appear above all  other elements on screen and only one can be displayed at a time.

#Usage

##Simple Snackbar

```html
<button (click)="snackbar.show()">Show snackbar</button>

<ig-snackbar #snackbar
            message="This is a simple snackbar!">
</ig-snackbar>
```

You can be more descriptive and set message `message="This is a simple snackbar!"`.

You can show the snacbar by using `snacbar.show()` method.


##Snackbar with button and action

```html
<button (click)="snackbar.show()">Show snackbar</button>

<ig-snackbar #snackbar
             message="This is a snackbar with a button and action!"
             actionName="Dismiss"
             (onAction)="snackbar.hide()">
</ig-snackbar>
```

You can set the title of the button by setting `actionName="Dissmis"`;

You can hide the Snackbar by using `snackbar.hide()` method.

The Snackbar will be automaticaly hiden after 10000 milliseconds, this can be controller by the
`displayTime` attribute, the automatic hiding can be also controller by using the `autoHide` attribute.