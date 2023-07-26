const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');

function getFunctionInfo(filePath, functionName) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const ast = acorn.parse(fileContent, { sourceType: 'module' });

  let foundFunctions = [];

  walk.simple(ast, {
    FunctionDeclaration(node) {
      if (node.id?.name === functionName) {
        const parameters = node.params.map(param => param.name);
        const start = node.body.start + 1; // Skip '{'
        const end = node.body.end - 1; // Skip '}'
        const code = fileContent.substring(start, end).trim();
        foundFunctions.push({ functionName, parameters, code });
      }
    },
    FunctionExpression(node) {
      if (node.id?.name === functionName) {
        const parameters = node.params.map(param => param.name);
        const start = node.body.start + 1; // Skip '{'
        const end = node.body.end - 1; // Skip '}'
        const code = fileContent.substring(start, end).trim();
        foundFunctions.push({ functionName, parameters, code });
      }
    },
  });

  return foundFunctions;
}

// function getFunctionInfo(filePath) {
//     const fileContent = fs.readFileSync(filePath, 'utf8');
//     const ast = acorn.parse(fileContent, { sourceType: 'module' });
  
//     const functionInfo = [];
  
//     walk.simple(ast, {
//       FunctionDeclaration(node) {
//         const functionName = node.id?.name || 'Anonymous Function';
//         const parameters = node.params.map(param => param.name);
//         const start = node.body.start + 1; // Skip '{'
//         const end = node.body.end - 1; // Skip '}'
//         const code = fileContent.substring(start, end).trim();
//         functionInfo.push({ functionName, parameters, code });
//       },
//       FunctionExpression(node) {
//         if (node.id) {
//           const functionName = node.id.name;
//           const parameters = node.params.map(param => param.name);
//           const start = node.body.start + 1; // Skip '{'
//           const end = node.body.end - 1; // Skip '}'
//           const code = fileContent.substring(start, end).trim();
//           functionInfo.push({ functionName, parameters, code });
//         }
//       },
//     });
  
//     return functionInfo;
// }

module.exports = getFunctionInfo;
