### Overview

A navigation bar is used to facilitate parent-child like navigational patterns within an app. A nav bar is placed above the content in a header/toolbar.

```html
<igx-navbar [title]="currentView" actionButtonIcon="arrow_back" [isActionButtonVisible]="canGoBack()"
     (onAction)="navigateBack()">
</igx-navbar>

```

Goals:
* Minimal API, focused on providing maximum flexibility for common use cases
* Mobile only approach
* Hybrid

### Critical developer stories
#### Define a page
As a citizen developer I want to define a page element.

#### Define a hierarchy
As a citizen developer I want to define a root page.

#### Back Button
As a citizen developer I want to add a Back Button icon to a nav bar. Back button pushes the previous page on the navigational stack and it is left aligned by default.

*Android*

<img src="https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navbar/wiki-images/1.png" alt="Arrow image" width="40">

*Ex.g.*

<img src="https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navbar/wiki-images/2.png" alt="Fun times image" width="260">

*iOS*

Back icon and the title of the previous page or just "Back".

<img src="https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navbar/wiki-images/3.png" alt="Back image" width="65">

*Ex.g.*

<img src="https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navbar/wiki-images/4.png" alt="Choose services image" width="300">

### Important developer stories
#### Title

As a citizen developer I want to add a Title to a Navigational bar.

*Android*

Next to the Back Button, left Aligned to the bar.

*Ex.g.*

 <img src="https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navbar/wiki-images/2.png" alt="Fun times image" width="260">

*iOS*
Centered to the bar.

*Ex.g.*

<img src="https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navbar/wiki-images/4.png" alt="Choose services image" width="300">

### Action Icons
As a citizen developer I want to add an unlimited number of icons alighned on the right side of the bar by default.

#### On Scroll
As a developer I want to hide/show the component as the main content is scrolled.

#### Search
As a citizen developer I want to add a search option located in a navigation bar. (more detalis in Search API)

*Android*
Back button disables Search

*Eg.x.*


<img src="https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navbar/wiki-images/7.png" alt="ada image" width="260">


*iOS*
Cancel disables back button, acts like a Back Button

*Ex.g.*

![Search photos image](https://github.com/IgniteUI/igniteui-js-blocks/blob/master/src/navbar/wiki-images/8.png)


### Nice-to-have developer stories
#### Gestures
As a citizen developer I want to define gestures to navigate back to the previous page.


### Critical User Stories
#### Back Button
As an user I want to be able to navigate back to my previous page with a back button.

### Important User Stories
#### Title
As an user I want to know the status of the system.

#### Action Buttons
As an user I want to apply actions on content of the view.

#### On Scroll
As  an user I want to hide/show the navigation bar as I scroll the main content.

#### Search
As an user I want to search thru my content.


### Nice-to-Have User Stories

#### Gestures
As an user I want to navigate to me previous page with the help of gestures


### Accessibility/ Internationalization

role=”navigation”
