# Overview  
Ignite UI for Angular version accepts contributions, as long as they follow the guidelines explained below. When contributing you would have to follow these steps:

1. Fork the repository or make a branch (if you have the necessary rights)
2. Perform the changes in your fork/branch
3. Create a pull request with your changes and reference the issue you're working on

Your pull request will undergo a review and if approved will be merged. All checks for the pull request should pass before a pull request is merged.

In order to perform all the necessary checks before pulling your changes in, you need to run

    npm install
    npm test

[Naming Convention](https://github.com/IgniteUI/igniteui-angular/wiki/General-Naming-Guidelines-for-Ignite-UI-JS-Blocks)  
[CSS Naming Convention](https://github.com/IgniteUI/igniteui-angular/blob/master/css-naming-convention.md)  

# Workflow
When working on an issue for the Ignite UI for Angular repository, you need to be aware of and to follow a correct status workflow. We have created a number of status labels in order to communicate well what the current status of a single issue/pull request is. The statuses are as follows:

## Development - applicable to issues

### Statuses
1. `status: in-review` this is the initial status of an issue. If the label is not placed, go ahead and place it.
2. `status: in-development` this is the status once you start working on an issue. Assign the issue to yourself if it hasn't been assigned already and remove the previous status and assign it an in development status.
3. `status: by-design` this is the status of an issue that has been reviewed and has been determined that the current design of the feature is such that the issue describes the correct behavior as incorrect. Remove other statuses and place this status if you've reviewed the issue.
4. `status: third-party-issue` this is the status of an issue that has been reviewed, has been determined to be an issue, but the root case is not in the Ignite UI for Angular code. Example would be browser specific bugs caused by the particular browser's rendering or JavaScript engines, or an issue with the Angular framework. Remove other statuses and place only this one if you're the one performing the investigation.
5. `status: not-to-fix` this is the status of issues that derive from our code, but have been decided to leave as is. This is done when fixes require general design and/or architecture changes and are very risky.
6. `status: already-fixed` this status indicates that the issue is already fixed in the source code. When setting this status assign the person that logged the issue so that he can verify the issue is fixed in the respective development branch. Remove other statuses and place this status if you've reviewed the issue.
7. `status: cannot-reproduce` this status indicates that you cannot reproduce the issue in the source code. A reason may be because the issue is already fixed. When setting this status assign the person that logged the issue so that he can respond with more details on how to reproduce it.
8. `status: not a bug` this is the status of an issue that you reviewed and concluded that it's not a bug. You should comment explaining the reasons why you think the issue is not a bug.
9. `status: resolved` this is the status of an issue that has been fixed and there are active pull requests related to it.

Example status workflows:

`status: in-review` => `status: in-development` => `status: resolved` (PR is created)

`status: in-review` => `status: by-design` (Issue can be closed)

`status: in-review` => `status: third-party-issue` (Issue can be closed)

`status: in-review` => `status: not-to-fix` (Issue can be closed)

### Versioning

When creating an issue assign a `version:` label. Add `version:` labels for each version for which the issue is applicable.

### Severity

When logging issue you should assign `severity:` label. If you cannot determine the issue severity use the `severity: medium` as initial label and a developer will re-evaluate it when doing investigation.

1. `severity: low` the issue is unnoticeable or barely noticeable in uncommon interactions with the feature. The issue does not affect end-user experience, or any of the general functionalities of the feature. The feature works fine if the issue persists to exist.
2. `severity: medium` the issue is noticeable, but only in certain scenarios, which are not commonly anticipated. The issue affects end-user experience to a lesser degree, but does not affect the general functionalities of the feature. The feature behaviors may be affected by this issue when new behaviors are added, or new integration scenarios are developed.
3. `severity: high` the issue is noticeable in common interaction scenarios. The issue affects the end-user experience significantly, and affects one or more of the general functionalities of the feature. The feature behaviors are affected by the issue, causing one or more of the behaviors to malfunction.
4. `severity: critical` the issue appears in a core interaction scenarios (80% use-cases). The issue is immediately noticeable by end-users and stops their interaction flow (an exception is thrown which prevents the user to continue their work with the UI, or breaks the UI completely). The issues affects one or more of the core functionalities of the feature causing them or the entire feature to stop functioning. 

### Triaging

Before release a triaging is done. Issues that need to be fixed for the release are marked with `triage: blocking` status.

## Testing - applicable to pull requests
1. `status: awaiting-test` this is the initial status of pull requests. If you're performing the pull request, please place this status on it. Pull requests are accepted if and only if all status checks pass, review is performed, and the pull request has been tested and contains `status: verified`.
2. `status: in-test` place this status once you pick up the pull request for testing.
3. `status: verified` place this status once you've tested the pull request, have verified that the issue is fixed, and have included all necessary automated tests for the issue.
4. `status: not-fixed` place this status once you've tested the pull request and you are still able to reproduce the issue it's attempting to fix. Then assign the developer back on the pull request.

Example status workflows:

`status: awaiting-test` => `status: in-test` => `status: verified` (PR can be merged if all prerequisites are met)

`status: awaiting-test` => `status: in-test` => `status: not-fixed` => `status: in-development` => `status: awaiting-test`


## Localization - applicable to issues and pull requests
1. `status: pending-localization` this status tells that there are changes in the localization strings that need to be translated. When you make such changes, put this status badge without removing the other applicable ones and assign a person to do the translations.
2. `status: localized` this status is for issues that were with a pending translation status and have already been localized. Place this status label once these translation changes have been included in the current pull request, or the changes are already pulled with a different pull request.

## Localization - applicable to components' string resources
There are several ways to localize components' string resources:

1. Using custom resource strings:
    1.1. Localize a given instance of component - each component which supports localization has input property `resourceStrings`. Setting a newly instantiated object to this property will localize only that given component's instance.
    1.2. Localize all resources for a component type - each component which supports localization has input property `resourceStrings`. To localize all instances of a given component in the application the following steps should be performed - get the value of the input property `resourceStrings` of the component to be localized; do not create a new instance but replace the existing strings within the object. By default all components of a given type in an application share one instance of the resource strings. Replacing a value in that instance affects all components of that type in the application.
    1.3. Localize all resources for all components - use global method `getCurrentResourceStrings` to get an object containing current resource strings for all components. To provide localized resources just pass an object of type `IResourceStrings` to the global method `changei18n`.

2. Using npm package:
We've created new repository which will hold the resource strings for languages different than English:
https://github.com/IgniteUI/igniteui-angular-i18n
A npm package should be published each time we release new version of IgniteUI for Angular. Its version should correspond to the version of the igniteui-angular npm package.
One could localize an application by importing the corresponding localized resource strings from the localization package (`igniteui-angular-i18n`) and use the methods described in the previous bullet to localize the whole application or part of it.
Example:
Inside app.module you can perform:
_import { IgxResouceStringsJA } from ‘igniteui-angular-i18n’;_
And then:
_Changei18n(IgxResouceStringsJA);_

###Resource strings keys naming convention
Each key in the `IResourceStrings` (and `IGridResourceStrings`, `ITimePickerResourceStrings`, etc.) is prefixed with components' selector and followed by the resource string key. Having components' selectors as prefixes allows us to have same resource strings keys for more than one component.
Example: _igx_grid_groupByArea_message_.

# Commit message conventions
When committing a message you need to follow this template convention:
`<type>(<scope>): <subject> <issue|optional>`

1. `<type>` - The type is the conventional type of the commit message. All possible choices you can find [here](https://github.com/pvdlg/conventional-commit-types#commit-types).
2. `<scope>` - The scope is the context on which you are worked on. It could be current directive, component etc. 
	If you are unable to determine your working context you can leave it as "(*)".
3. `<subject>` - The subject (first line of the Commit message) is the most critical. So be sure you have clear and easy understandable description about the commit.
	The limit of the subject is at least `15` characters.
4. `<issue>` - The issue is the refenrece of the github task you have. Be aware that you are able to link more than one issue. For instance `(#123 #456)`. 
	Also there is another important point, for `(fix, feat, test) types` you are obliged to add at least one issue reference.
5. The limits you have per line is `80` characters.
### example: "feat(checkbox): add ripple, indeterminate state, and label #123"

# Fixing a bug  
When fixing a bug you need to follow these guidelines:

1. Leave a comment above your change in the format `<initials> <date> <Issue Number|Issue Link> <Comment for the change>`
   * e.g. `K.D. June 28th, 2016 #1234 Adding this comment as an example`
   * e.g. `K.D. June 28th, 2016 https://github.com/IgniteUI/ignite-ui/issues/1234 Adding this comment as an example`
2. Write unit tests that cover your change. The test should fail prior to your change and pass after it
3. Run JSHint, JSCS, Unit tests and make sure they all pass
4. Pull request your changes and reference the issue. Use the following title/description format.
   * Title: `<Issue Number> <Change Title>` Description: `closes <Issue Number> <Longer Description>`
   * e.g. Title: `#123 Changing foo to bar` Description: `closes #123`
5. Don't forget to make the necessary status updates, as described in the workflow section.

When bug fixes are applicable to multiple branches, there will be additional steps between 3 and 4. So if let’s say we have a 5.2.x, 5.3.x, and a master branch the process will look like this:

1.	If the bug is in 5.2.x, then switch the branch your branching from to `5.2.x`. For code example purposes let's say the new branch is called `fixing-bug-52x`.
2.	Commit your changes to your `fixing-bug-52x` branch.
3.	Push and PR to the `5.2.x` branch.
4.	Switch to the `5.3.x` branch.
5.  Create a new branch.  For code example purposes let's say the new branch is called `fixing-bug-53x`.
6.  Cherry pick your commit from the `fixing-bug-52x` branch: `git cherry-pick fixing-bug-52x`
7.  Push to your `fixing-bug-53x` branch and PR to the `5.3.x` branch.
8.	Repeat steps 4-7 for all other applicable branches including `master`.

# New feature development
In order to contribute code to a new feature, you need to follow these guidelines.

1. Work on implementation in your fork
2. Follow a test-driven development process (TDD) to ensure full code coverage, or make sure that you include unit tests that cover all of the newly added code
3. Document all newly added public methods, inputs, outputs and properties.
4. Make sure all static code analysis and tests pass before opening a pull request
5. Reference the issue you've been working on in your commit message and pull request title/description.
6. Don't forget to make the necessary status updates, as described in the workflow section.

# Breaking changes and migrations
If the bug fix or new feature development requires changes to released public API or behavior in a way that'll njo longer be compatible with an existing user code base:

1. Describe in the appropriate section in the [CHANGELOG.md](https://github.com/IgniteUI/igniteui-angular/blob/master/CHANGELOG.md)
2. Add a `BREAKING CHANGE:` section to the commit message body or footer. See https://www.conventionalcommits.org
3. Check if the change can be migrated by `ng update` schematics and add to the project migrations. See [Update Migrations wiki](https://github.com/IgniteUI/igniteui-angular/wiki/Update-Migrations) for available functionality and instructions.


# Testing a PR
In order to test a pull request that is awaiting test, perform the following actions.

1. Checkout the master branch locally. *Depending on the PR target this can also be a version branch.*
2. Verify that the issue describes correctly the current behavior of the feature/control.
3. If you reproduce the issue, checkout the pull request locally.

  Replace the `<PULL_ID>` with the respective pull number in the following:
  ```bash
  git fetch igniteui-angular +refs/pull/<PULL_ID>/merge
  git checkout -qf FETCH_HEAD
  ```
  > Note that the above assumes the remote for this repo is "igniteui-angular" but "https://github.com/IgniteUI/igniteui-angular.git" can be used as well. This uses a detached and temporary ref to quickly get PR merged state the same as the CI builds so there's no branch to dispose of after switching away. If you do want to make some changes, consider creating a branch from the pull request one or check out the [Checking out pull requests locally](https://help.github.com/articles/checking-out-pull-requests-locally/) article.
4. Verify that the expected behavior is observed with the changes in the pull request.
5. Return the pull request in a not fixed state if you're still reproducing the issue.
6. Don't forget to make the necessary status updates, as described in the workflow section.
