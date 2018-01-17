# Overview  
Ignite UI JS Blocks version accepts contributions, as long as they follow the guidelines explained below. When contributing you would have to follow these steps:

1. Fork the repository
2. Perform the changes in your fork
3. Create a pull request with your changes and reference the issue you're working on

Your pull request will undergo a review and if approved will be merged. All checks for the pull request should pass before a pull request is merged.

In order to perform all the necessary checks before pulling your changes in, you need to run

    npm install
    npm test

[Naming Convention](https://github.com/IgniteUI/igniteui-angular/wiki/General-Naming-Guidelines-for-Ignite-UI-JS-Blocks)  
[CSS Naming Convention](https://github.com/IgniteUI/igniteui-angular/blob/master/css-naming-convention.md)  

# Workflow
When working on an issue for the Ignite UI JS Blocks repository, you need to be aware of and to follow a correct status workflow. We have created a number of status labels in order to communicate well what the current status of a single issue/pull request is. The statuses are as follows:

## Development - applicable to issues and pull requests
1. `status: in-review` this is the initial status of an issue. If the label is not placed, go ahead and place it.
2. `status: in-development` this is the status once you start working on an issue. Assign the issue to yourself if it hasn't been assigned already and remove the previous status and assign it an in development status.
3. `status: by-design` this is the status of an issue that has been reviewed and has been determined that the current design of the feature is such that the issue describes the correct behavior as incorrect. Remove other statuses and place this status if you've reviewed the issue.
4. `status: third-party-issue` this is the status of an issue that has been reviewed, has been determined to be an issue, but the root case is not in the Ignite UI JS Blocks code. Example would be browser specific bugs caused by the particular browser's rendering or JavaScript engines, or an issue with the Angular framework. Remove other statuses and place only this one if you're the one performing the investigation.
5. `status: not-to-fix` this is the status of issues that derive from our code, but have been decided to leave as is. This is done when fixes require general design and/or architecture changes and are very risky.

## Testing - applicable to pull requests
1. `status: awaiting-test` this is the initial status of pull requests. If you're performing the pull request, please place this status on it. Pull requests are accepted if and only if all status checks pass, review is performed, and the pull request has been tested and contains `status: verified`.
2. `status: in-test` place this status once you pick up the pull request for testing.
3. `status: verified` place this status once you've tested the pull request, have verified that the issue is fixed, and have included all necessary automated tests for the issue.
4. `status: not-fixed` place this status once you've tested the pull request and you are still able to reproduce the issue it's attempting to fix. Then assign the developer back on the pull request.

## Localization - applicable to issues and pull requests
1. `status: pending-localization` this status tells that there are changes in the localization strings that need to be translated. When you make such changes, put this status badge without removing the other applicable ones and assign a person to do the translations.
2. `status: localized` this status is for issues that were with a pending translation status and have already been localized. Place this status label once these translation changes have been included in the current pull request, or the changes are already pulled with a different pull request.

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
