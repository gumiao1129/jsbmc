// generateTestFile.js
const fs = require('fs');
const convertOperatorToJestMatcher = require('./convertOperatorToJestMatcher');

function generateTestFile(fileLocation, functionName, codeBody, testCasesVariables, argumentType) {
    const assertRegex = /assert\((.*)\);/;
    const match = codeBody.match(assertRegex);

    if (!match) {
      throw new Error('Invalid assert statement.');
    }

    const codeInsideAssert = match[1];
    // List of common JavaScript operators
    const operators = ['==', '===', '!=', '!==', '>', '>=', '<', '<='];

    // Create a regular expression pattern for matching operators
    const operatorPattern = new RegExp(operators.map(op => '\\' + op).join('|'), 'g');
    const operator = codeInsideAssert.match(operatorPattern);
    if (!operator) {
      throw new Error('Invalid operator in the assert statement.');
    }
    const operatorSymbol = operator[0];
    const jestSymbol = convertOperatorToJestMatcher(operatorSymbol);
    // Split the code body by operators
    const splitCode = codeInsideAssert.split(operatorPattern);
    // Filter out empty strings from the split result
    const filteredCode = splitCode.filter(item => item.trim() !== '');
    
    let testCases = '';

    if(testCasesVariables.length > 0){
      for(let i = 0; i < testCasesVariables.length; i++){
          testCases += `
          test('test case variable: ${testCasesVariables[i]} ', () => {
            expect(${filteredCode[0].replace(argumentType, testCasesVariables[i])}).toBe(${filteredCode[1].replace(argumentType, testCasesVariables[i])});
          });
          
          `;
      }
    }
    else{
      throw new Error('There is no test variables setup.');
    }
  const testFileContent = `
const ${functionName} = require('${fileLocation}');

${testCases}
`;

  fs.writeFileSync(`./__tests__/${functionName}.test.js`, testFileContent);
  console.log(`Test file ${functionName}.test.js generated successfully.`);
}

module.exports = generateTestFile;