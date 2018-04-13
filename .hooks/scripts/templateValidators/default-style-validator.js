'use strict';

var matchType = require('../common').matchType,
    errorFactory = require('../common').errorFactory,
    errMessages = require('../common').errorMessages;

module.exports = (lines, options, errors) => {
    var scheme = '<type>(<scope>): <subject> <#issue|optional>';
    var prefix = `First line must be ${scheme}\n`;

    var line = lines[0];
    if (line.startsWith('revert: ')) {
        line = line.replace(/^revert: /, '');
        prefix = `First line must be revert: ${scheme}\n`;
    } else if (line.startsWith('revert')) {
        errors.push(errorFactory(errMessages.WRONG_REVERT_STRUCT, 'revert: ' + scheme));
        
        return;
    }

    if (!matchType(options.types, line)) {
        errors.push(errorFactory(prefix, errMessages.MESSAGE_SHOULD_START_WITH_TYPE, options.types.join(', ')));
        
        return;
    }

    if (line.indexOf('(') === -1) {
        errors.push(errorFactory(prefix, errMessages.NEED_OPENING_PARENTHESIS));

        return;
    }

    var type = line.replace(/\(.*/, '');
    if (options.types.indexOf(type) === -1) {
        errors.push(errorFactory(prefix, errMessages.TYPE_WAS_INVALID, options.types.join(', ')));

        return;
    }

    if (line.indexOf(')') === -1) {
        errors.push(errorFactory(prefix, errMessages.NEED_CLOSING_PARENTHESIS));

        return;
    }

    var scope = line.slice(line.indexOf('(') + 1, line.indexOf(')'));
    if (scope.length === 0) {
        errors.push(errorFactory(prefix, errMessages.SCOPE_WAS_EMPTY));
    }
    
    if (line.indexOf(type + '(' + scope + '):') === - 1) {
        errors.push(errorFactory(prefix, errMessages.NEED_A_COLON));
        
        return;
    }

    var subject = line.split(':')[1];
    if (subject === "" || !subject.startsWith(' ')) {
        errors.push(errorFactory(prefix, errMessages.NEED_SPACE_AND_SUBJECT));
        
        return;
    }

    subject = subject.trim();

    if (subject.length === 0) {
        errors.push(errorFactory(errMessages.SUBJECT_WAS_EMPTY));
        
        return;
    }

    if (subject.length < options.subjectLimits) {
        errors.push(`<subject> should contains at least ${options.subjectLimits} characters`);
    }
}