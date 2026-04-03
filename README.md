![ignite-ui-logo-flames](https://user-images.githubusercontent.com/52001020/173773052-e8fd2806-2631-47a8-838d-1eabdaa4afce.svg)


<h1 align="center">
  Ignite UI for Angular - from Infragistics 
</h1>


![Node.js CI](https://github.com/IgniteUI/igniteui-angular/workflows/Node.js%20CI/badge.svg)
[![Build Status](https://dev.azure.com/IgniteUI/igniteui-angular/_apis/build/status/IgniteUI.igniteui-angular)](https://dev.azure.com/IgniteUI/igniteui-angular/_build/latest?definitionId=3)
[![Coverage Status](https://coveralls.io/repos/github/IgniteUI/igniteui-angular/badge.svg?branch=master)](https://coveralls.io/github/IgniteUI/igniteui-angular?branch=master)
[![npm version](https://badge.fury.io/js/igniteui-angular.svg)](https://badge.fury.io/js/igniteui-angular)
[![Discord](https://img.shields.io/discord/836634487483269200?logo=discord&logoColor=ffffff)](https://discord.gg/39MjrTRqds)

[Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular) is a complete library of Angular-native, Material-based Angular UI components designed to enable developers to build enterprise-ready HTML5 & JavaScript apps for modern desktop browsers. It packs full-featured components, including Pivot Grids, Dock Manager, Hierarchical Grid, Bottom Navigation, etc., 60+ high-performance Angular Charts for all business needs and any app scenario, and more.

You can find source files under the [`src`](https://github.com/IgniteUI/igniteui-angular/tree/master/src) folder, including samples and tests.
Or visit [Ignite UI for Angular Discord](https://discord.com/channels/836634487483269200/836636712292581456) and join the dev community there.

### Contributing
There are many ways in which you can [participate](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md#overview) in this project, for example:

 - [Submit bugs and feature requests](https://github.com/IgniteUI/igniteui-angular/wiki/How-to-log-an-Issue-on-Github), and help us verify as they are checked in.
 - Review [source code changes](https://github.com/IgniteUI/igniteui-angular/pulls)
 - Review [the documentation](https://github.com/IgniteUI/igniteui-docfx) and make pull requests for anything from typos to additional and new content
 - If you are interested in fixing issues and contributing directly to the code base, please see the document [How to Contribute](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md#fixing-a-bug), which covers the following:

 - [How to build and run from source](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md#fixing-a-bug)
 - The [development workflow](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md#workflow), including debugging and running tests
 - [Coding guidelines](https://github.com/IgniteUI/igniteui-angular/wiki/General-Naming-and-Coding--Guidelines-for-Ignite-UI-for-Angular)
 - [Submitting pull requests](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md#commit-message-conventions)
 - [New feature development](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md#new-feature-development)
 - [Accessibility and Localization](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md#accessibility-a11y)
 - [Testing a PR](https://github.com/IgniteUI/igniteui-angular/blob/master/.github/CONTRIBUTING.md#testing-a-pr)

### Feedback
 - Ask a question by starting [a discussion](https://github.com/IgniteUI/igniteui-angular/discussions) or submitting [an issue](https://github.com/IgniteUI/igniteui-angular/issues/new/choose)
 - Request a [new feature](https://github.com/IgniteUI/igniteui-angular/issues/new?assignees=&labels=%3Atoolbox%3A+feature-request&template=feature_request.md&title=)
 - Upvote [popular feature requests](https://github.com/IgniteUI/igniteui-angular/issues?q=is%3Aopen+is%3Aissue+label%3A%22%3Atoolbox%3A+feature-request%22)
 - [File an issue](https://github.com/IgniteUI/igniteui-angular/wiki/How-to-log-an-Issue-on-Github)
 - Reach out to us [through Discord](https://discord.gg/sBwHs5cJ)

### AI-Assisted Development

This repository ships with **Copilot Skills** — structured knowledge files that teach AI coding assistants (GitHub Copilot, Cursor, Windsurf, Claude, JetBrains AI, etc.) how to work with Ignite UI for Angular. The skill files live in the [`skills/`](skills/) directory:

| Skill | Path | Description |
|:------|:-----|:------------|
| Components | [`skills/igniteui-angular-components/SKILL.md`](skills/igniteui-angular-components/SKILL.md) | UI Components (form controls, layout, data display, feedback/overlays, directives — Input Group, Combo, Select, Date/Time Pickers, Calendar, Tabs, Stepper, Accordion, List, Card, Dialog, Snackbar, Button, Ripple, Tooltip, Drag and Drop, Layout Manager, Dock Manager and Charts (Area Chart, Bar Chart, Column Chart, Stock/Financial Chart, Pie Chart)) |
| Data Grids | [`skills/igniteui-angular-grids/SKILL.md`](skills/igniteui-angular-grids/SKILL.md) | Data Grids (grid type selection, column config, sorting, filtering, selection, editing, grouping, paging, remote data, state persistence, Tree Grid, Hierarchical Grid, Grid Lite, Pivot Grid) |
| Theming & Styling | [`skills/igniteui-angular-theming/SKILL.md`](skills/igniteui-angular-theming/SKILL.md) | Theming & Styling (includes MCP server setup) |

#### How It Works

- **GitHub Copilot (VS Code / github.com)** — Skills should be discovered automatically via [`.github/copilot-instructions.md`](.github/copilot-instructions.md). No extra setup needed.
- **Cursor** — Skills are picked up from the `skills/` directory. You can also reference them explicitly in `.cursorrules`.

#### Manual Setup for Other IDEs

If your editor doesn't auto-discover skill files, you can feed them to your AI assistant manually:

1. **Copy the skill content** — Open the relevant `SKILL.md` file from the `skills/` folder and paste its contents into your AI assistant's system prompt or context window.
2. **JetBrains IDEs (WebStorm, IntelliJ)** — Go to **Settings → Tools → AI Assistant → Project-level prompt** and paste the skill content there, or attach the files as context when chatting.
3. **Claude Desktop / Claude Code** — Add the files to your project knowledge or include them as part of your CLAUDE.md project instructions.
4. **Windsurf** — Reference the skill files in your `.windsurfrules` configuration or attach them as context in the chat.
5. **Other editors** — Attach or paste the `SKILL.md` file contents into your AI assistant's context before asking questions about Ignite UI for Angular.

#### Theming MCP Server

The **Theming skill** includes setup instructions for the `igniteui-theming` MCP server, which gives AI assistants access to live theming tools (palette generation, component theme scaffolding, etc.). See [`skills/igniteui-angular-theming/SKILL.md`](skills/igniteui-angular-theming/SKILL.md) for configuration steps for VS Code, Cursor, Claude Desktop, and JetBrains IDEs.
 
## Browser Support

| ![chrome][] | ![firefox][] | ![edge][] | ![opera][] | ![safari][] | ![ie][] |
|:-----------:|:------------:|:---------:|:----------:|:-----------:|:-------:|
|  Latest ✔   |   Latest ✔   | Latest ✔  |  Latest ✔  |  Latest ✔   |   11*   |

\* *IE 11 is only supported in Ignite UI for Angular < 13.0.0*

## Overview

### Angular Data Grid

The Ignite UI for [Angular Data Grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid) equips you with all the necessary features for manipulating and visualizing tabular data in a series of rows and columns with ease. You can find powerful grid elements for no-lag scrolling while rendering and going through millions of data points.

Built for optimization and speed, our [Angular grid](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid) component lets you quickly bind data with very little code and allows you to implement a variety of events in order to tailor different behaviors.

#### [View running Grid samples here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid)

### Angular Charts & Graphs

Ignite UI for Angular arrives with an extensive library of data visualizations that enable stunning, interactive charts and dashboards for your modern web and mobile apps. All of them are designed to work flawlessly on every modern browser and provide complete touch as well as interactivity. Our comprehensive [Angular Charts](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/chart-overview) component supports more than 65 chart types that let you display all sorts of data representations and statistics. And with the rich and easy-to-use API, you can plot various types of charts.

Some of the Angular chart types included are: [Polar chart](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/polar-chart), [Pie chart](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/pie-chart), [Donut chart](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/donut-chart), [Bubble chart](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/bubble-chart), [Area chart](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/area-chart), [Treemap chart](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/treemap-chart), and many others. And if you look for [Angular financial charts](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/stock-chart), with Ignite UI you can get the same features as the ones you come across with Google Finance and Yahoo Finance Charts.

### Current List of Components Include:

|Components|Status|||Added in|License|Directives|Status|||Added in|License|
|:--|:--:|:--|:--|:--|:--|:--:|:--|:--|:--|:--|:--|
|accordion|:white_check_mark:|[Readme](projects/igniteui-angular/accordion/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/accordion)|12.1.0|[MIT](/LICENSE)|autocomplete|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/autocomplete/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/autocomplete)|7.1.0|[MIT](/LICENSE)
|avatar|:white_check_mark:|[Readme](projects/igniteui-angular/avatar/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/avatar)|2.0.0|[MIT](/LICENSE)|button|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/button/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/button)|2.0.0|[MIT](/LICENSE)
|badge|:white_check_mark:|[Readme](projects/igniteui-angular/badge/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/badge)|2.0.0|[MIT](/LICENSE)|date time editor|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/date-time-editor/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-time-editor)|9.1.0|[MIT](/LICENSE)
|banner|:white_check_mark:|[Readme](projects/igniteui-angular/banner/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner)|7.0.2|[MIT](/LICENSE)|divider|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/divider/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/divider)|7.2.5|[MIT](/LICENSE)
|bottom navigation|:white_check_mark:|[Readme](projects/igniteui-angular/bottom-nav/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabbar)|2.0.0|[MIT](/LICENSE)|dragdrop|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/drag-drop/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drag-drop)|5.2.0|[MIT](/LICENSE)
|button group|:white_check_mark:|[Readme](projects/igniteui-angular/button-group/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/button-group)|5.1.0|[MIT](/LICENSE)|filter|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/filter/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list)|2.0.0|[MIT](/LICENSE)
|calendar|:white_check_mark:|[Readme](projects/igniteui-angular/calendar/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/calendar)|5.1.0|[MIT](/LICENSE)|focus-trap|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/focus-trap/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dialog)|13.0.0|[MIT](/LICENSE)
|card|:white_check_mark:|[Readme](projects/igniteui-angular/card/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/card)|5.1.0|[MIT](/LICENSE)|forOf|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/for-of/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/for-of)|5.2.0|[MIT](/LICENSE)
|carousel|:white_check_mark:|[Readme](projects/igniteui-angular/carousel/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/carousel)|2.0.0|[MIT](/LICENSE)|hint|:white_check_mark:|[Readme](projects/igniteui-angular/input-group/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input-group)|5.3.0|[MIT](/LICENSE)
|chat|:white_check_mark:|[Readme]()|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chat)|21.0.0|[MIT](/LICENSE)|checkbox|:white_check_mark:|[Readme](projects/igniteui-angular/checkbox/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/checkbox)|2.0.0|[MIT](/LICENSE)|input|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/input/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input-group)|2.0.0|[MIT](/LICENSE)|
|chips|:white_check_mark:|[Readme](projects/igniteui-angular/chips/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chip)|6.1.0|[MIT](/LICENSE)|label|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/label/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/label-input)|2.0.0|[MIT](/LICENSE)
|circular progress|:white_check_mark:|[Readme](projects/igniteui-angular/progressbar/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/circular-progress)|5.1.0|[MIT](/LICENSE)|layout|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/layout/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/layout)|2.0.0|[MIT](/LICENSE)
|combo|:white_check_mark:|[Readme](projects/igniteui-angular/combo/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo)|6.1.0|[MIT](/LICENSE)|mask|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/mask/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/mask)|5.3.0|[MIT](/LICENSE)
|date picker|:white_check_mark:|[Readme](projects/igniteui-angular/date-picker/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-picker)|5.3.0|[MIT](/LICENSE)|prefix|:white_check_mark:|[Readme](projects/igniteui-angular/input-group/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input-group)|5.3.0|[MIT](/LICENSE)
|date range picker|:white_check_mark:|[Readme](projects/igniteui-angular/date-picker/src/date-range-picker/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-range-picker)|9.1.0|[MIT](/LICENSE)|radio-group|:white_check_mark:||[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio-button)|6.0.4|[MIT](/LICENSE)
|dialog|:white_check_mark:|[Readme](projects/igniteui-angular/dialog/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dialog)|2.0.0|[MIT](/LICENSE)|ripple|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/ripple/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/ripple)|2.0.0|[MIT](/LICENSE)
|dock manager|:white_check_mark:||[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dock-manager)|9.1.0|[Commercial](/LICENSE)|suffix|:white_check_mark:|[Readme](projects/igniteui-angular/input-group/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input-group)|5.3.0|[MIT](/LICENSE)
|drop down|:white_check_mark:|[Readme](projects/igniteui-angular/drop-down/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop-down)|6.1.0|[MIT](/LICENSE)|text-highlight|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/text-highlight/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/texthighlight)|6.0.0|[MIT](/LICENSE)
|expansion panel|:white_check_mark:|[Readme](projects/igniteui-angular/expansion-panel/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/expansion-panel)|6.2.0|[MIT](/LICENSE)|toggle|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/toggle/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toggle)|6.2.0|[MIT](/LICENSE)
|grid|:white_check_mark:|[Readme](projects/igniteui-angular/grids/grid/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid)|5.1.0|[Commercial](/LICENSE)|tooltip|:white_check_mark:|[Readme](projects/igniteui-angular/directives/src/directives/tooltip/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip)|6.2.0|[MIT](/LICENSE)
|hierarchical grid|:white_check_mark:|[Readme](projects/igniteui-angular/grids/hierarchical-grid/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/hierarchicalgrid/hierarchical-grid)|7.2.0|[Commercial](/LICENSE)|**Others**|**Status**||**License**|
|icon|:white_check_mark:|[Readme](projects/igniteui-angular/icon/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/icon)|2.0.0|[MIT](/LICENSE)
|icon button|:white_check_mark:|[Readme](projects/igniteui-angular/icon/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/icon-button)|17.1.0|[MIT](/LICENSE)|Animations|:white_check_mark:|[Readme](projects/igniteui-angular/animations/README.md)||2.0.0|[MIT](/LICENSE)|
|input group|:white_check_mark:|[Readme](projects/igniteui-angular/input-group/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input-group)|5.3.0|[MIT](/LICENSE)|dataUtil|:white_check_mark:|[Readme](projects/igniteui-angular/core/src/core/README.md)||5.1.0|[MIT](/LICENSE)|
|linear progress|:white_check_mark:|[Readme](projects/igniteui-angular/progressbar/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/linear-progress)|5.1.0|[MIT](/LICENSE)|dataContainer|:white_check_mark:|[Readme](projects/igniteui-angular/core/README.md)||5.1.0|[MIT](/LICENSE)||
|list|:white_check_mark:|[Readme](projects/igniteui-angular/list/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list)|2.0.0|[MIT](/LICENSE)|IgxGridState|:white_check_mark:|[Readme](projects/igniteui-angular/grids/core/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/state-persistence)|9.0.0|[MIT](/LICENSE)||
|month picker|:white_check_mark:|[Readme](projects/igniteui-angular/calendar/src/calendar/month-picker/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/month-picker)|7.2.0|[MIT](/LICENSE)||||
|navbar|:white_check_mark:|[Readme](projects/igniteui-angular/navbar/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navbar)|2.0.0|[MIT](/LICENSE)|||||
|navigation drawer|:white_check_mark:|[Readme](projects/igniteui-angular/navigation-drawer/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navdrawer)|2.0.0|[MIT](/LICENSE)|||||
|pivot grid|:white_check_mark:|[Readme](projects/igniteui-angular/grids/pivot-grid/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/pivotgrid/pivot-grid)|13.1.0|[Commercial](/LICENSE)||||
|query builder|:white_check_mark:|[Readme](projects/igniteui-angular/query-builder/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/query-builder)|14.2.0|[Commercial](/LICENSE)||||
|radio|:white_check_mark:|[Readme](projects/igniteui-angular/radio/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio-button)|2.0.0|[MIT](/LICENSE)|||||
|rating|:white_check_mark:||[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/rating)|14.1.0|[MIT](/LICENSE)||||
|select|:white_check_mark:|[Readme](projects/igniteui-angular/select/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/select)|5.3.0|[MIT](/LICENSE)||||
|simple-combo|:white_check_mark:|[Readme](projects/igniteui-angular/simple-combo/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/simple-combo)|13.0.0|[MIT](/LICENSE)||||
|slider|:white_check_mark:|[Readme](projects/igniteui-angular/slider/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/slider/slider)|5.1.0|[MIT](/LICENSE)||||
|snackbar|:white_check_mark:|[Readme](projects/igniteui-angular/snackbar/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/snackbar)|5.1.0|[MIT](/LICENSE)||||
|splitter|:white_check_mark:|[Readme](projects/igniteui-angular/splitter/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/splitter)|9.1.0|[MIT](/LICENSE)||||
|stepper|:white_check_mark:|[Readme](projects/igniteui-angular/stepper/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/stepper)|13.0.0|[MIT](/LICENSE)|
|switch|:white_check_mark:|[Readme](projects/igniteui-angular/switch/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/switch)|2.0.0|[MIT](/LICENSE)|||||
|tabs|:white_check_mark:|[Readme](projects/igniteui-angular/tabs/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabs)|5.1.0|[MIT](/LICENSE)||||
|tile manager|:white_check_mark:||[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tile-manager)|19.2.0|[MIT](/LICENSE)||||
|time picker|:white_check_mark:|[Readme](projects/igniteui-angular/time-picker/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/time-picker)|5.3.0|[MIT](/LICENSE)||||
|toast|:white_check_mark:|[Readme](projects/igniteui-angular/toast/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast)|5.1.0|[MIT](/LICENSE)||||
|tree|:white_check_mark:|[Readme](projects/igniteui-angular/tree/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tree)|12.0.0|[MIT](/LICENSE)||||
|tree grid|:white_check_mark:|[Readme](projects/igniteui-angular/grids/tree-grid/README.md)|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/treegrid/tree-grid)|6.2.0|[Commercial](/LICENSE)||||

### Release History

|Ignite UI for Angular|Release date|Milestone|
|:----|:----|:----|
| | ||
|4.0.0|18-April-17||
|4.1.0|12-May-17||
|4.2.0|20-Jul-17||
|5.0.0|03-Nov-17||
|5.1.0|17-Jan-18|[Milestone #1](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-1-by-january-15th-2018)|
|5.2.0|23-Feb-18||
|5.3.0|24-Apr-18|[Milestone #2](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-2-due-april-25th-2018)|
|6.0.0|21-May-18||
|6.1.0|05-Jul-18|[Milestone #3](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-3-by-july-6th-2018)|
|6.2.0|05-Nov-18||
|7.0.0|26-Nov-18|[Milestone #4](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-4-november-30th-2018)|
|7.1.0|13-Dec-18|[Milestone #5](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-5-14122018)|
|7.2.0|08-Mar-19|[Milestone #6](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-6-due-march-8th-2019)|
|7.3.0|13-May-19|[Milestone #7](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-7-13052019)|
|8.0.0|19-Jun-19||
|8.1.0|22-Jul-19|[Milestone #8](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-8-released-july-22nd-2019)|
|8.2.0|26-Sep-19|[Milestone #9](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-9-version-820-released-september-26th-2019-release-blog-82)|
|9.0.0|11-Feb-20|[Milestone #10](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-10-version-900-released-february-11th-2020-release-blog-90)|
|9.1.0|01-Jun-20|[Milestone #11](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-11-version-910-released-june-1st-2020-release-blog-91)|
|10.0.0|25-Jun-20|[Milestone #12](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-12-version-1000--1010-released-august-12th-2020-release-blog-100)|
|10.1.0|12-Aug-20|[Milestone #12](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-12-version-1000--1010-released-august-12th-2020-release-blog-100)|
|10.2.0|20-Oct-20|[Milestone #13](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-13-version-1020-released-october-20th-2020-release-blog-102)|
|11.0.0|13-Nov-20|[Milestone #14](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-14-version-1100-released-november-11th-2020-release-blog-110)|
|11.1.0|17-Feb-21|[Milestone #15](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-15-version-1110-released-february-17th-2021-release-blog-111)|
|12.0.0|14-May-21|[Milestone #16](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-16-version-1200-released-may-14th-2021-release-blog-1200)|
|12.1.0|02-Aug-21|[Milestone #17](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-17--version-1210-released-august-2nd-2021-releae-blog-121)|
|12.2.0|04-Oct-21|[Milestone #18](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-18-version-1220-released-october-4th-2021-release-blog-122)|
|13.0.0|23-Nov-21|[Milestone #19](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-19-version-130-released-november-23rd-2021-release-blog-130)|
|13.1.0|02-Mar-22|[Milestone #20](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-20-version-131-released-march-2nd-2022-release-blog-131)|
|13.2.0|25-May-22|[Milestone #21](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-21-version-132-released-may-25th-2022-release-blog-221)|
|14.0.0|09-Jun-22|[Milestone #22](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-22-version-140-released-june-09th-2022-release-blog-221)|
|14.1.0|13-Sep-22|[Milestone #23](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-23-version-141-released-september-13th-2022-release-blog-141)|
|14.2.0|06-Oct-22|[Milestone #24](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-24-version-142-released-october-06th-2022-release-blog-222)|
|15.0.0|23-Nov-22|[Milestone #25](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-25-version-150-released-november-23rd-2022-release-blog-150)|
|15.1.0|27-Mar-23|[Milestone #26](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-26-version-151-releasd-march-28th-2023)|
|16.0.0|15-May-23|[Milestone #27](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-27-version-160-released-may-15th-2023-release-blog-160)|
|16.1.0|02-Oct-23|[Milestone #28](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-28-version-161-released-oct-5th-2023-release-blog-161)|
|17.0.0|09-Nov-23|[Milestone #29](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-29-version-170-released-nov-9th-2023-release-blog-170)|
|17.1.0|26-Feb-24|[Milestone #30](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-30-version-171-released-feb-26th-2024)|
|17.2.0|29-Apr-24|[Milestone #31](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-31-version-172-released-apr-29th-2024)|
|18.0.0|07-Jun-24|[Milestone #32](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-32-version-180-released-jun-07th-2024)|
|18.1.0|22-Jul-24|[Milestone #33](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-33-due-by-jul-2024)|
|18.2.0|25-Oct-24|[Milestone #34](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-34-version-182-released-oct-25th-2024)|
|19.0.0|25-Nov-24|[Milestone #35](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-35-version-190-released-nov-25th-2024)|
|19.1.0|27-Feb-25|[Milestone #36](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-36--version-191-released-feb-27th-2025)|
|19.2.0|16-Apr-25|[Milestone #37](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-37--version-192-released-apr-16th-2025-release-blog-192)|
|20.0.0|09-Jun-25|[Milestone #38](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-38-version-200-released-jun-09th-2025)|
|20.1.0|25-Sep-25|[Milestone #39](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md#milestone-39-version-201-released-sep--25th-2025)|
|21.0.0|03-Dec-25|[Milestone #40]()|


### Components available in [igniteui-angular-charts](https://www.npmjs.com/package/igniteui-angular-charts)
|Components||License|
|:---|:---|:---|
|Bar Chart|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/bar-chart)|[Commercial](/LICENSE)|
|Line Chart|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/line-chart)|[Commercial](/LICENSE)|
|Financial Chart|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/stock-chart)|[Commercial](/LICENSE)|
|Doughnut Chart|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/donut-chart)|[Commercial](/LICENSE)|
|Pie Chart|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/charts/types/pie-chart)|[Commercial](/LICENSE)|

### Components available in [igniteui-angular-gauges](https://www.npmjs.com/package/igniteui-angular-gauges)
|Components||License|
|:---|:---|:---|
|Bullet Graph|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/bullet-graph)|[Commercial](/LICENSE)|
|Linear Gauge|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/linear-gauge)|[Commercial](/LICENSE)|
|Radial Gauge|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radial-gauge)|[Commercial](/LICENSE)|

### Components available in [igniteui-angular-excel](https://www.npmjs.com/package/igniteui-angular-excel)
|Components||License|
|:---|:---|:---|
|Excel Library|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/excel-library)|[Commercial](/LICENSE)|


### Components available in [igniteui-angular-spreadsheet](https://www.npmjs.com/package/igniteui-angular-spreadsheet)
|Components||License|
|:---|:---|:---|
|Spreadsheet|[Docs](https://www.infragistics.com/products/ignite-ui-angular/angular/components/spreadsheet-overview)|[Commercial](/LICENSE)|

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
npm run build:styles

// build them both
npm run build:lib
```

You can find the build output under `dist/igniteui-angular`.

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

`npm install igniteui-angular`

## Contributing
[General Naming and Coding Guidelines for Ignite UI for Angular](https://github.com/IgniteUI/igniteui-angular/wiki/General-Naming-and-Coding--Guidelines-for-Ignite-UI-for-Angular)

## Demo Apps & Documentation

### List of Angular Demo Apps
- [Warehouse Picklist App](https://github.com/IgniteUI/warehouse-js-blocks) - Demonstrates using several Ignite UI for Angular widgets together to build a modern, mobile app.

- [FinTech Grid App]( https://github.com/Infragistics/angular-samples/tree/master/Grid/FinJS) - The Ignite UI for Angular Grid component is able to handle thousands of updates per second, while keeping the grid responsive for any interaction that the user may undertake. This sample demonstrates the Angular Grid handling thousands of updates per second.

- [FinTech Tree Grid App](https://github.com/Infragistics/angular-samples/tree/master/TreeGrid/FinJS) - The Ignite UI for Angular Tree Grid component is able to handle thousands of updates per second, while keeping the grid responsive for any interaction that the user may undertake. This sample demonstrates the Tree Grid handling thousands of updates per second.

- [Crypto Portfolio App](https://github.com/IgniteUI/crypto-portfolio-app) - This is a web and mobile application, developed with Ignite UI for Angular components and styled with our one of a kind theming engine.

- [Task Planner Application](https://github.com/IgniteUI/TaskPlanner) – Task Planner is an Angular web application. It provides an effective means for managing projects and related tasks. Thus, it loads data from the Web API endpoint, enabling the user to start managing - filtering and sorting tasks, editing tasks, adding new tasks. It shows nice UX UI perks like ability to Drag and Drop items from and to the List and Data Grid.

- [Dock Manager with Data Analysis Tool](https://github.com/IgniteUI/DockManager-DataAnalysis) - The Data Analysis sample application provides users with the flexibility to customize the data visualization using one of several chart types. Built with Angular UI components, it showcases the Angular Data Grid integrated with an Angular Data Chart, Angular Pie Chart, and an Angular Category Chart, to provide an interactive and engaging visualization. The Dock Manager web component provides a windowing experience, allowing users to customize the layout and view, and make the data more accessible.

- [COVID-19 Dashboard](https://github.com/IgniteUI/COVID-19-Dashboard) - This dynamic dashboard was built using Indigo.Design and Ignite UI for Angular leveraging timely reports data from CSSEGISandData/COVID-19 to create an useful and impactful visualization. Built in a matter of hours, it showcases the Ignite UI Category and Data Charts, Map and List components for Angular and the how easy it is to get those quickly configured and populated with data.

- [Inventory Management App](https://github.com/IgniteUI/InventoryManagementApp) - The Inventory Management App consists of 2 pages: The Products Page and the Dashboard Page. The Products Page contains a grid with product information and includes a number of useful features

### Angular apps with ASP.NET Core Web Application
If you consider Angular client side application with ASP.NET Core application you can check out our [ASP.NET-Core-Samples](https://github.com/IgniteUI/ASP.NET-Core-Samples)

### Documentation
To get started with the Data Grid, use the steps in the [grid walk-through](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid).

All help, related API documents and walk-throughs can be found for each control [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/getting-started).


## Roadmap
[Roadmap document](https://github.com/IgniteUI/igniteui-angular/blob/master/ROADMAP.md)

## Support
Developer support is provided as part of the commercial, paid-for license via [Infragistics Forums](https://www.infragistics.com/community/forums/), or via Chat & Phone with a Priority Support license.  To acquire a license for paid support or Priority Support, please visit this [page](https://www.infragistics.com/how-to-buy/product-pricing#developers).

Community support for open source usage of this product is available at [StackOverflow](https://stackoverflow.com/questions/tagged/ignite-ui-angular).

## License
This software package is offered under a dual-license model, which allows for both commercial and permissive open-source use, depending on the components, modules, directives, and services being used.

It is crucial to understand which license applies to which part of the package.

© Copyright 2025 INFRAGISTICS. All Rights Reserved.
The Infragistics Ultimate license & copyright applies to this distribution.
For information on that license, please go to [LICENSE](LICENSE).



<!-- browser logos -->
[chrome]: https://user-images.githubusercontent.com/2188411/168109445-fbd7b217-35f9-44d1-8002-1eb97e39cdc6.png "Google Chrome"
[firefox]: https://user-images.githubusercontent.com/2188411/168109465-e46305ee-f69f-4fa5-8f4a-14876f7fd3ca.png "Mozilla Firefox"
[edge]: https://user-images.githubusercontent.com/2188411/168109472-a730f8c0-3822-4ae6-9f54-785a66695245.png "Microsoft Edge"
[opera]: https://user-images.githubusercontent.com/2188411/168109520-b6865a6c-b69f-44a4-9948-748d8afd687c.png "Opera"
[safari]: https://user-images.githubusercontent.com/2188411/168109527-6c58f2cf-7386-4b97-98b1-cfe0ab4e8626.png "Safari"
[ie]: https://user-images.githubusercontent.com/2188411/168135931-ce5259bb-5b26-4003-8b89-dbee3d4f247c.png "Internet Explorer"
