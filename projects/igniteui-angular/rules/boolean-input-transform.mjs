import { ASTUtils, Selectors } from '@angular-eslint/utils';
// import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import { TypeFlags } from 'typescript';

// export type Options = [
//   {
//     suffixes?: string[];
//   },
// ];

// export type MessageIds = 'serviceSuffix';

export const RULE_NAME = 'boolean-input-transform';

/**
 * Check if a property is of boolean type.
 * @param {import('@typescript-eslint/utils').TSESTree.PropertyDefinition | import('@typescript-eslint/utils').TSESTree.MethodDefinition} property
 * @param {import('@typescript-eslint/utils').ParserServicesWithTypeInformation} parserServices
 * @returns {boolean}
 */
function isBooleanProperty(property, parserServices) {
    let isBoolean = false;
    let typeAnnotation = null;

    if (property.type === 'MethodDefinition' && (property.kind === 'get' || property.kind === 'set')) {
        // getter/setter
        const typeAnnotation = property.value.returnType?.typeAnnotation || property.value.params[0]?.typeAnnotation?.typeAnnotation;
        isBoolean = typeAnnotation
            ? typeAnnotation === 'TSBooleanKeyword'
            : isBooleanType(property, parserServices);

    } else if (property.type === 'PropertyDefinition') {
        isBoolean = property.typeAnnotation
            && property.typeAnnotation.typeAnnotation.type === 'TSBooleanKeyword';

        isBoolean ||= property.value
            && property.value.type === 'Literal'
            && typeof property.value.value === 'boolean';
    }
    return isBoolean;
}

/**
 * Type-aware check if a property is of boolean type.
 * @param {import('@typescript-eslint/utils').TSESTree.Node} node
 * @param {import('@typescript-eslint/utils').ParserServicesWithTypeInformation} parserServices
 * @returns {boolean}
 */
function isBooleanType(node, parserServices) {
    const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
    const checker = parserServices.program.getTypeChecker();
    const type = checker.getTypeAtLocation(tsNode);
    return (type.flags & TypeFlags.BooleanLike) !== 0;
}

export const rule = ESLintUtils.RuleCreator.withoutDocs({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require boolean @Input properties to use { transform: booleanAttribute }',
      recommended: 'error',
    },
    schema: [],
    messages: {
      missingTransform:
        'Boolean @Input properties must have { transform: booleanAttribute }.',
    },
  },
  defaultOptions: [],
  create(context, [ /* options*/ ]) {
    // const parserServices = ESLintUtils.getParserServices(context);
    // const checker = parserServices.program.getTypeChecker();

    const ruleOptions = {
      [Selectors.INPUT_DECORATOR](decorator) {
        const property = decorator.parent;

        if (!ASTUtils.isPropertyOrMethodDefinition(property)) return;

        const classDeclaration = ASTUtils.getNearestNodeFrom(
            decorator,
            ASTUtils.isClassDeclaration,
        );
        // classDeclaration.body.body.indexOff(property);

        let isBoolean = isBooleanProperty(property/*, parserServices*/);

        if (!isBoolean) return;

        const comments = context.sourceCode.getCommentsBefore(classDeclaration.decorators[0] ?? classDeclaration);
        if (comments.some(x => x.value.includes('@hidden') || x.value.includes('@internal')))
            return;

        const arg = decorator.expression.arguments[0];
        const hasTransform =
            arg &&
            arg.type === 'ObjectExpression' &&
            arg.properties.some(
            (p) =>
                p.key.name === 'transform' &&
                p.value.name === 'booleanAttribute'
            );

        if (hasTransform) return;

        context.report({ node: decorator, messageId: 'missingTransform' });
      },
    };
    return ruleOptions;
  },
});
