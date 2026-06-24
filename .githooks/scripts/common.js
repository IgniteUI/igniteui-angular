'use strict';

module.exports = {
    matchType: (types, line) => {
        return types.some(function(type) {
            if (line.startsWith(type)) {
                return true;
            }

            return false;
        });
    },

    errorFactory: (prefix, message, additionalParams) => {
        var result = '';
        if (prefix) {
            result = prefix;
        }

        result += message;

        if (additionalParams) {
            result += additionalParams;
        }
        
        return result;
    },

    errorMessages: {
        MESSAGE_SHOULD_START_WITH_TYPE: 'Message should start with one of the following types:\n',
        NEED_OPENING_PARENTHESIS: 'Need an opening parenthesis right after the type: (',
        TYPE_WAS_EMPTY: '<type> was empty, it must be one of these: \n',
        TYPE_WAS_INVALID: '<type> was invalid, It has to be one of these:\n',
        NEED_CLOSING_PARENTHESIS: 'Need a closing parenthesis after scope declaration: <scope>")"',
        SCOPE_WAS_EMPTY: "<scope> cannot be empty!",
        NEED_A_COLON: "Need a colon after the closing parenthesis: ):",
        NEED_SPACE_AND_SUBJECT: 'Need a space and <subject> after colon: ": <subject>"',
        SUBJECT_WAS_EMPTY: '<subject> must not be empty',
        WRONG_REVERT_STRUCT: 'If this is a revert of a previous commit, please write:\n',
        UNDEFINED_OF_COMMIT_MSG: 'Commit message is undefined, abort with error',
        MSG_IS_NOT_A_STRING: 'Commit message is not a string, abort with error',
        MSG_IS_EMPTY: 'Commit message is empty, abort with error'
    }
}