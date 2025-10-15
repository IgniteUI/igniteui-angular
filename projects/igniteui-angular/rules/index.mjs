import {
  rule as booleanInputTransform,
  RULE_NAME as booleanInputTransformRuleName,
} from './boolean-input-transform.mjs';

export default {
  rules: {
    [booleanInputTransformRuleName]: booleanInputTransform,
  }
};
