# igx-snackbar

**igx-snackbar** provides feedback about an operation by showing a brief message at the bottom of the screen on mobile and lower left on larger devices. IgxSnackbar will appear above all other elements on screen and only one can be displayed at a time.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/snackbar)

# Usage

## Simple Snackbar

```html
<button (click)="snackbar.open()">Show snackbar</button>

<igx-snackbar #snackbar
            message="This is a simple snackbar!">
</igx-snackbar>
```

You can be more descriptive and set a message `message="This is a simple snackbar!"`.

You can show the snackbar by using `snackbar.open()` method.


## Snackbar with button and action

```html
<button (click)="snackbar.open()">Show snackbar</button>

<igx-snackbar #snackbar
             message="This is a snackbar with a button and action!"
             actionName="Dismiss"
             (onAction)="snackbar.close()">
</igx-snackbar>
```
You can set the id of the component by `id="Snackbar"`, otherwise it will be automatically generated.

You can set the title of the button by setting `actionName="Dismiss"`.

You can hide the Snackbar by using `snackbar.close()` method.

By default, the IgxSnackbar will be automatically hidden after 4000 milliseconds. The automatic hiding behavior can be controlled via the following attributes:
 - `autoHide` - whether the snackbar should be hidden after a certain time interval.
 - `displayTime` - the time interval in which the snackbar would hide.


## Snackbar with custom content

```html
<button (click)="snackbar.open()">Show snackbar</button>

<igx-snackbar #snackbar
             actionName="Dismiss"
             (onAction)="snackbar.close()">
    <span>Custom content</span>
</igx-snackbar>
```
You can display custom content by adding elements inside the snackbar.
