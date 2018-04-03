'use strict';

var matchType = require('../common').matchType,
    errorFactory = require('../common').errorFactory;

module.exports = function(lines, options, errors) {
    var ticket = new RegExp(options.issuePattern);
    var whetherIssueIsMandatory = false,
        wheterMatchAnyIssueRef = false; 

    lines.forEach(function (line) {
        line = line.trim();
        if (line === "") {
            return;
        }

        if (matchType(options.typesWithMandatoryIssue, line)) {
            whetherIssueIsMandatory = true;
        }

        if (ticket.test(line)) {
            wheterMatchAnyIssueRef = true;
            return;
        }
    });

    if (!whetherIssueIsMandatory && !wheterMatchAnyIssueRef) {
        errors.push(errorFactory(
            'The issue reference for (' + options.typesWithMandatoryIssue.join(', ') + ') types is mandatory!\n',
            'List any ISSUES CLOSED by this change. E.g: Closes #31, Closes #45'));
    }
}