'use strict';

var matchType = require('../common').matchType,
    errorFactory = require('../common').errorFactory;

module.exports = function(lines, options, errors) {
    var ticket = new RegExp(options.issuePattern);
    var whetherIssueIsMondatory = false,
        wheterMatchAnyIssueRef = false; 

    lines.forEach(function (line) {
        line = line.trim();
        if (line === "") {
            return;
        }

        if (matchType(options.typesWithMandatoryIssue, line)) {
            whetherIssueIsMondatory = true;
        }

        if (ticket.test(line)) {
            wheterMatchAnyIssueRef = true;
            return;
        }
    });

    if (!wheterMatchAnyIssueRef && !wheterMatchAnyIssueRef) {
        errors.push(errorFactory(
            'The issue reference for (' + options.typesWithMandatoryIssue.join(', ') + ') types is mandatory!\n',
            'List any ISSUES CLOSED by this change. E.g: Closes #31, Closes #45'));
    }
}