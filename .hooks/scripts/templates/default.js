'use strict';

var path = require('path');

var defaults = {
    default: {
        style: 'default',
        subjectLimits: 15,
        lineLimits: {
            firstLine: 80,
            otherLine: 80,
        },
        issuePattern: '(#)[0-9]+',
        typesWithMandatoryIssue: [ 'feat', 'fix', 'test' ],
        guidelinesUrl: 'https://bit.ly/angular-guidelines',
        types: [
            'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'build', 'ci', 'revert'
        ],
    },
    oldMessagePath: path.join('.git', 'COMMIT_EDITMSG_OLD')
}

module.exports = defaults;