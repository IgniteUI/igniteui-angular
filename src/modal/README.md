ig-modal
--------------------

**ig-modal** supports dialog component that opens centered on top of the app content.

With the ig-modal you can create **alerts**, **dialogs** and **custom dialogs**

#Usage

##Alerts are done by adding title, message and button label.

```html
<ig-modal #alert 
    title="Alert"
    message="Your email has been sent successfully!"
    action1ButtonLabel="OK" (onAction1Select)="alert.close()">
</ig-modal>
```
You can set title to the alert `title="TitleofTheAlert"`

You can be more descriptive and set message `message="Your email has been sent successfully!"`

You can attach to the action select event `(onAction1Select)="alert.close()"`


##Dialogs are done by adding another button.

```html
<ig-modal #dialog 
    title="Confirmation" 
    message="Are you sure you want to delete the Microsoft_Annual_Report_2015.pdf and Microsoft_Annual_Report_2015.pdf files?"
    action1ButtonLabel="Cancel"
    (onAction1Select)="dialog.close()"
    action2ButtonLabel="OK"
    (onAction2Select)="onDialogOKSelected($event)">
</ig-modal>
```

You can access all properties of the button component with the following attributes:

`action1ButtonLabel`

`action1ButtonType`

`action1ButtonColor`

`action1ButtonBackgroundColor`

`action1ButtonRipple`


##Custom Dialogs are done by adding any mark up in the ig-modal tag.
When you are using Custom Dialogs you don't have a message property set.

```HTML
<ig-modal #form 
    title="Sign In"
    action1ButtonLabel="Cancel"
    (onAction1Select)="form.close()"
    action2ButtonLabel="Sign In"
    action2ButtonBackgroundColor="green"
    action2ButtonColor="white"
    backgroundClick="true">
    <div class="ig-form-group">
        <input type="text" igInput />
        <label igLabel>Username</label>
    </div>
    <div class="ig-form-group">
        <input type="password" igInput />
        <label igLabel>Password</label>
    </div>
</ig-modal>
```

You can make the dialog dimissible `backgroundClick="true"``
