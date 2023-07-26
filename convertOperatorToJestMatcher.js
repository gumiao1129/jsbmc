function convertOperatorToJestMatcher(operator) {
    const operatorToMatcherMap = {
      '==': 'toBe',
      '===': 'toStrictEqual',
      '!=': 'not.toBe',
      '!==': 'not.toStrictEqual',
      '>': 'toBeGreaterThan',
      '>=': 'toBeGreaterThanOrEqual',
      '<': 'toBeLessThan',
      '<=': 'toBeLessThanOrEqual'
    };
  
    return operatorToMatcherMap[operator] || 'toBe';
  }

  module.exports = convertOperatorToJestMatcher;