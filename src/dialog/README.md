igx-dialog
--------------------

**igx-dialog** supports dialog component that opens centered on top of the app content.

With the igx-dialog you can create **alerts**, **dialogs** and **custom dialogs**.

#Usage

##Alerts are done by adding title, message and button label.

```html
<igx-dialog #alert
    title="Alert"
    message="Your email has been sent successfully!"
    leftButtonLabel="OK" (onLeftButtonSelect)="alert.close()">
</igx-dialog>
```
You can set title to the alert `title="TitleofTheAlert"`

You can be more descriptive and set message `message="Your email has been sent successfully!"`

You can attach to the left button select event `(onLeftButtonSelect)="alert.close()"`


##Dialogs are done by adding another button.

```html
<igx-dialog #dialog
    title="Confirmation"
    message="Are you sure you want to delete the Microsoft_Annual_Report_2015.pdf and Microsoft_Annual_Report_2015.pdf files?"
    leftButtonLabel="Cancel"
    (onLeftButtonSelect)="dialog.close()"
    rightButtonLabel="OK"
    (onRightButtonSelect)="onDialogOKSelected($event)">
</igx-dialog>
```

You can access all properties of the button component with the following attributes:

`leftButtonLabel`

`leftButtonType`

`leftButtonColor`

`leftButtonBackgroundColor`

`leftButtonRipple`


##Custom Dialogs are done by adding any mark up in the igx-dialog tag.
When you are using Custom Dialogs you don't have a message property set.

```HTML
<igx-dialog #form
    title="Sign In"
    leftButtonLabel="Cancel"
    (onLeftButtonSelect)="form.close()"
    rightButtonLabel="Sign In"
    rightButtonBackgroundColor="green"
    rightButtonColor="white"
    closeOnOutsideSelect="true">
    <div class="ig-form-group">
        <input type="text" igInput />
        <label igLabel>Username</label>
    </div>
    <div class="ig-form-group">
        <input type="password" igInput />
        <label igLabel>Password</label>
    </div>
</igx-dialog>
```

You can make the dialog dismissible `closeOnOutsideSelect="true"``
