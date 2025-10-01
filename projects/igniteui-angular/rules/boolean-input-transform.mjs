import { ASTUtils, Selectors } from '@angular-eslint/utils';
// import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { TypeFlags } from 'typescript';

// export type Options = [
//   {
//     prop?: string;
//   },
// ];

// export type MessageIds = 'missingTransform';

export const RULE_NAME = 'boolean-input-transform';

/**
 * Get the sibling accessor (getter/setter) of a property, if any.
 * @param {import('@typescript-eslint/utils').TSESTree.ClassDeclaration} classDeclaration
 * @param {import('@typescript-eslint/utils').TSESTree.PropertyDefinition | import('@typescript-eslint/utils').TSESTree.MethodDefinition} property
 * @returns {import('@typescript-eslint/utils').TSESTree.MethodDefinition | undefined} sibling accessor or undefined
 */
function getSiblingProperty(classDeclaration, property) {
    const members = classDeclaration.body.body;
    const index = members.indexOf(property);
    return [members[index - 1], members[index + 1]]
        .filter(Boolean)
        .find(sibling => isAccessor(sibling) && sibling.key.name === property.key.name);
}

/**
 * Check if a property is a getter or setter.
 * @param {import('@typescript-eslint/utils').TSESTree.PropertyDefinition | import('@typescript-eslint/utils').TSESTree.MethodDefinition} property
 * @returns {property is import('@typescript-eslint/utils').TSESTree.MethodDefinition}
 */
function isAccessor(property) {
    return property.type === AST_NODE_TYPES.MethodDefinition && (property.kind === 'get' || property.kind === 'set');
}

/**
 * Check if a property is of boolean type.
 * @param {import('@typescript-eslint/utils').TSESTree.PropertyDefinition | import('@typescript-eslint/utils').TSESTree.MethodDefinition} property
 * @param {import('@typescript-eslint/utils').ParserServicesWithTypeInformation} parserServices
 * @returns {boolean}
 */
function isBooleanProperty(property, parserServices) {
    let isBoolean = false;
    let typeAnnotation = null;

    if (!property) return false;

    if (isAccessor(property)) {
        // getter/setter
        const typeAnnotation = property.value.returnType?.typeAnnotation || property.value.params[0]?.typeAnnotation?.typeAnnotation.type;
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
    return false;
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
        // classDeclaration.body.body.indexOf(property);

        let isBoolean = isAccessor(property)
            ? isBooleanProperty(property) || isBooleanProperty(getSiblingProperty(classDeclaration, property))
            : isBooleanProperty(property/*, parserServices*/);

        if (!isBoolean) return;

        const comments = context.sourceCode.getCommentsBefore(classDeclaration.decorators[0] ?? classDeclaration);
        if (comments.some(x => x.value.includes('@hidden') || x.value.includes('@internal')))
            return;

        const hasTransform = ASTUtils.getDecoratorProperty(decorator, 'transform')?.value.name === 'booleanAttribute';

        if (hasTransform) return;

        context.report({ node: decorator, messageId: 'missingTransform' });
      },
    };
    return ruleOptions;
  },
});
