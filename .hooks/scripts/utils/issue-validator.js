'use strict';

var matchType = require('../common').matchType,
    errorFactory = require('../common').errorFactory;

module.exports = (lines, options, errors) => {
    var ticket = new RegExp(options.issuePattern);
    var whetherIssueIsMandatory = false,
        wheterMatchAnyIssueRef = false; 

    
    if (matchType(options.typesWithMandatoryIssue, lines[0])) {
        whetherIssueIsMandatory = true;
    }

    lines.forEach((line) => {
        line = line.trim();
        if (line === "") {
            return;
        }

        if (ticket.test(line)) {
            wheterMatchAnyIssueRef = true;
            return;
        }
    });

    if (whetherIssueIsMandatory && !wheterMatchAnyIssueRef) {
        errors.push(errorFactory(
            `The issue reference for (${options.typesWithMandatoryIssue.join(', ')}) types is mandatory!\n`, 
            "Please add at least one related issue. E.g: Closes #31, Closes #45"));
    }
}