# Ignite UI for Angular - from Infragistics

[![Build Status](https://dev.azure.com/IgniteUI/igniteui-angular/_apis/build/status/IgniteUI.igniteui-angular)](https://dev.azure.com/IgniteUI/igniteui-angular/_build/latest?definitionId=3)
[![Build Status](https://travis-ci.org/IgniteUI/igniteui-angular.svg?branch=master)](https://travis-ci.org/IgniteUI/igniteui-angular)
[![Coverage Status](https://coveralls.io/repos/github/IgniteUI/igniteui-angular/badge.svg?branch=master)](https://coveralls.io/github/IgniteUI/igniteui-angular?branch=master)
[![npm version](https://badge.fury.io/js/igniteui-angular.svg)](https://badge.fury.io/js/igniteui-angular)

[Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular) is a complete set of Material-based UI Widgets, Components & Sketch UI kits and supporting directives for [Angular](https://angular.io/) by Infragistics.  Ignite UI for Angular is designed to enable developers to build the most modern, high-performance HTML5 & JavaScript apps for modern desktop browsers, mobile experiences and progressive web apps (PWA’s) targeting Google's Angular framework.

You can find source files under the [`src`](https://github.com/IgniteUI/igniteui-angular/tree/master/src) folder, including samples and tests.

#### [**View running samples here**](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html)
#### [**Install our VSCode Toolbox extension**](https://marketplace.visualstudio.com/items?itemName=Infragistics.igniteui-angular-toolbox)
![](https://dl.infragistics.com/tools/extensions/angular-toolbox/toolbox.gif)
#### [**Install our VSCode tooltip extension**](https://marketplace.visualstudio.com/items?itemName=Infragistics.igniteui-angular-tooltips)
![](https://dl.infragistics.com/tools/extensions/angular-tooltips/tooltip_preview.gif)

**IMPORTANT** The repository has been renamed from `igniteui-js-blocks` to `igniteui-angular`. Read more on our new [naming convention](https://www.infragistics.com/community/blogs/b/infragistics/posts/ignite-ui-github-repo-name-changes).
 
Current list of controls include:


| *Components*          | Status        |                                                                                                                                               |                                                                                                           |     | *Directives*            | Status            |                                                                                                                                               |                                                                                                           |
| :-:                   | :-:           | :-:                                                                                                                                           | :-:                                                                                                       | :-: | :-:                     | :-:               | :-:                                                                                                                                           | :-:                                                                                                       |
| **avatar**            | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/avatar/README.md)                         | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/avatar.html)            |     | **button**              |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/button/README.md)              | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/button.html)            |
| **badge**             | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/badge/README.md)                          | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/badge.html)             |     | **dragdrop**            |     InProgress    | [Readme](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/directives/dragdrop/README.md)            | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drag_drop.html)         |
| **banner**            | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/banner/README.md)                         | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner.html)            |     | **filter**              |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/filter/README-FILTER.md)       | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list.html)              |    
| **buttonGroup**       | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/buttonGroup/README.md)                    | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/buttongroup.html)       |     | **forOf**               |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/for-of/README.md)              | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/for_of.html)            |
| **calendar**          | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/calendar/README.md)                       | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/calendar.html)          |     | **hint**                |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/input-group/README.md)                    | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input_group.html)       |                                                                                                                                                                                                                                                            
| **card**              | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/card/README.md)                           | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/card.html)              |     | **input**               |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/input/README.md)               | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input_group.html)       |
| **carousel**          | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/carousel/README.md)                       | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/carousel.html)          |     | **label**               |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/label/README.md)               | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input_group.html)       |
| **checkbox**          | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/checkbox/README.md)                       | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/checkbox.html)          |     | **layout**              |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/layout/README.md)              | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/layout.html)            |
| **chips**             | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/chips/README.md)                          | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chip.html)              |     | **mask**                |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/mask/README.md)                | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/mask.html)              |
| **circular progress** | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/progressbar/README.md)                    | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/circular_progress.html) |     | **prefix**              |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/input-group/README.md)                    | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input_group.html)       |
| **combo**             | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/combo/README.md)                          | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo.html)             |     | **radio-group**	        |	  Available		|																																				| [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio_button.html#radio-group)|
| **datePicker**        | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/date-picker/README.md)                    | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date_picker.html)       |     | **ripple**              |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/ripple/README.md)              | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/ripple.html)            |		 
| **dialog**            | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/dialog/README.md)                         | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dialog.html)            |	  | **suffix**              |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/input-group/README.md)                    | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input_group.html)       |	
| **drop down**         | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/drop-down/README.md)                      | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop_down.html)         |     | **text-highlight**      |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/directives/text-highlight/README.md)      | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/texthighlight.html)     |
| **expansion-panel**   | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/expansion-panel/README.md)                | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/expansion_panel.html)   |	  | **toggle**              |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/toggle/README.md)              | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toggle.html)            | 	
| **grid**              | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/grids/README.md)                          | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html)              |     |	**tooltip**				|	  Available		| [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/directives/tooltip/README.md)				| [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip.html)			| 
| **icon**              | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/icon/README.md)                           | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/icon.html)              | 	  | *Others*                | 		Status      | Docs                                                                                                                                          |                                                                                                           | 	 
| **input group**       | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/input-group/README.md)                    | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input_group.html)      	|	  | **Animations**          |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/animations/README.md)                     |                                                                                                           |                                                   |
| **linear progress**	| Available		| [Readme](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/src/lib/progressbar)								| [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/linear_progress.html)	|	  | **dataUtil**            |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/data-operations/README-DATAUTIL.md)       |                                                                                                           |       
| **list**              | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/list/README.md)                           | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list.html)              |	  | **dataContainer**       |     Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/data-operations/README-DATACONTAINER.md)  |                                                                                                           |
| **navbar**            | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/navbar/README.md)                         | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navbar.html)            |     |                         |                   |                                                                                                                                               |                                                                                                           | 			
| **navigation drawer** | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/navigation-drawer/README.md)              | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navdrawer.html)         |     |                         |                   |                                                                                                                                               |                                                                                                           | 
| **radio**             | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/radio/README.md)                          | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio_button.html)      |     |                         |                   |                                                                                                                                               |                                                                                                           | 
| **slider**            | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/slider/README.md)                         | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/slider.html)            |     |                         |                   |                                                                                                                                               |                                                                                                           |
| **snackbar**          | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/snackbar/README.md)                       | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/snackbar.html)          |     |                         |                   |                                                                                                                                               |                                                                                                           |
| **switch**            | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/switch/README.md)                         | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/switch.html)            |     |                         |                   |                                                                                                                                               |                                                                                                           |
| **bottomnavigation**            | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/tabbar/README.md)                         | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabbar.html)            |     |                         |                   |                                                                                                                                               |                                                                                                           |
| **tabs**              | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/tabs/README.md)                           | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabs.html)              |     |                         |                   |                                                                                                                                               |                                                                                                           |
| **time picker**       | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/time-picker/README.md)                    | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/time_picker.html)       |     |                         |                   |                                                                                                                                               |                                                                                                           |
| **toast**             | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/toast/README.md)                          | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast.html)             |     |                         |                   |                                                                                                                                               |                                                                                                           |
| **tree grid**         | Available     | [Readme](https://github.com/IgniteUI/igniteui-angular/blob/master/projects/igniteui-angular/src/lib/grids/tree-grid/README.md)                | [Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid.html)          |     |                         |                   |                                                                                                                                               |                                                                                                           |


## Setup
From the root folder run:

```
npm install
```

## Create new Project with Ignite UI CLI
To get started with the Ignite UI CLI and Ignite UI for Angular:

```
npm i -g igniteui-cli
ig new <project name> --framework=angular
cd <project name>
ig add grid <component name>
ig start
```

## Adding IgniteUI for Angular to Existing Project

Including the `igniteui-angular` and `igniteui-cli` packages to your project:

```
ng add igniteui-angular
```

After this operation you can use the Ignite UI CLI commands in your project, such as `ig` and `ig add`.
[Learn more](https://github.com/IgniteUI/igniteui-cli#usage)

## Updating Existing Project

Analyze your project for possible migrations:

```
ng update
```

If there are new versions available, update your packages:

```
ng update igniteui-angular
...
ng update igniteui-cli
```

## Building the Library
```
// build the code
ng build igniteui-angular

// build the css
npm run build:style

// build them both
npm run build:lib
```

You can find the build ouput under `dist/igniteui-angular`.

## Running the tests

Running the tests in watch mode:

```
ng test igniteui-angular // or npm run test:lib:watch
```

Running the tests once with code coverage enabled:
```
npm run test:lib
```

## Building the API Docs
The API docs are produced using TypeDoc and SassDoc. In order to build the docs, all you need to do is run:

```
npm run build:docs
```

The output of the API docs build is located under `dist/igniteui-angular/docs`.

## Run Demos Application

The repository includes a sample application featuring the showcasing the different components/directives.
In order to run the demo samples, build the library first and start the application.
```
npm start
```

**NOTE**: Experimental demos are not always stable.

## NPM Package

You can include Ignite UI for Angular in your project as a dependency using the NPM package.

`npm install igniteui-angular --save-dev`

## Contributing
[Coding Guidelines](../../wiki//Coding-guidelines-for-Ignite-UI-for-Angular)

[General Naming Guidelines](../../wiki//General-Naming-Guidelines-for-Ignite-UI-for-Angular)

## Demo Apps & Documentation
The [Warehouse Picklist App](https://github.com/IgniteUI/warehouse-js-blocks) demonstrates using several Ignite UI for Angular widgets together to build a modern, mobile app.

The [Crypto Portfolio App](https://github.com/IgniteUI/crypto-portfolio-app) is a web and mobile application, developed with Ignite UI for Angular components and styled with our one of a kind theming engine.

To get started with the Data Grid, use the steps in the [grid walk-through](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html).

All help, related API documents and walk-throughs can be found for each control [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html).

## Roadmap
[Roadmap document](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md)

## Support
Developer support is provided as part of the commercial, paid-for license via [Infragistics Forums](https://www.infragistics.com/community/forums/), or via Chat & Phone with a Priority Support license.  To acquire a license for paid support or Priority Support, please visit this [page](https://www.infragistics.com/how-to-buy/product-pricing#developers).

Community support for open source usage of this product is available at [StackOverflow](https://stackoverflow.com/questions/tagged/ignite-ui-angular).

## License
This project is released under the Apache License, version 2.0.  This is a commercial product, requiring a valid paid-for license for commercial use.  This product is free to use for non-commercial applications, like non-profits and educational usage.

To acquire a license for commercial usage, please register for a trial and acquire a license at [Infragistics.com/Angular](https://www.infragistics.com/products/ignite-ui-angular/getting-started).

© Copyright 2017 INFRAGISTICS. All Rights Reserved.  The Infragistics Ultimate license & copyright applies to this distribution.  For information on that license, please go to our website [here](https://www.infragistics.com/legal/license).



