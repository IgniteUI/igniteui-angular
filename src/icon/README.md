igx-icon
--------------------

**igx-icon** supports icon component that unifies various icon/font sets to allow their usage interchangeably.

With the igx-icon you can add **material-icons** in your markup

#Usage

```html
    <igx-icon fontSet="material" name="home" color="magenta" isActive="false"></igx-icon>
```

You can set the fontSet to `fontSet="material"` to select the material icons set (default). More to be added later.

You can set the icon by providing its name from the official [material icons set](https://material.io/icons/) `name="home"`.

You can set the icon color by providing a string value with the color `color="#474747"`

You can attach set the icon to active/inactive by providing setting `isActive="true"` to true or false (default is true).


You can access all properties of the button component with the following attributes:

`fontSet`

`name`

`color`

`isActive`


**Setters**
You can programatically set all of the icon properties with the following icon setters: 

`fontSet(fontFamily: string)` sets the icon font family
`color(color: string)` sets the icon color
`name(icon: string)` sets the icon name
`isActive(state: boolean)` sets the icon style to inactive if set the false

**Getters**
You can programatically get all of the icon properties with the following icon getters: 

`getFontSet()` returns the icon font family
`getIconColor()` returns the icon color
`getIconName()` returns the icon name
`getActive()` returns the icon active state