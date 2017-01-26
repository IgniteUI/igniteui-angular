igx-card
--------

**igx-card** is a sheet of material that serves as an entry point to more detailed information.

#Usage

##Simple Card

```html
<igx-card>
    <igx-card-header>
        <igx-avatar src="http://localhost/images/elon-musk-avatar.jpg" roundShape="true">
            <h3>Elon Musk</h3>
        </igx-avatar>
    </igx-card-header>

    <img width="100%" src="http://localhost/images/elon-musk-image.jpg">

    <igx-card-content>
        <p>South African entrepreneur Elon Musk is known for founding Tesla Motors and SpaceX, which launched a landmark commercial spacecraft in 2012.</p>
    </igx-card-content>

    <igx-card-actions>
        <button igxButton (click)="openUrl('https://www.facebook.com/pages/Elon-Musk/108250442531979')">Like</button>
        <button igxButton (click)="openUrl('https://twitter.com/elonmusk')">Share</button>
    </igx-card-actions>
</igx-card>
```