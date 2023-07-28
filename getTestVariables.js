const RandExp = require('randexp');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomString(minLength, maxLength) {
  //const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const possibleChars = 'abcdefghijklmnopqrstuvwxyz';
  const randomLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let randomString = '';

  for (let i = 0; i < randomLength; i++) {
    const randomIndex = Math.floor(Math.random() * possibleChars.length);
    randomString += possibleChars.charAt(randomIndex);
  }

  return `'${randomString}'`;
}


function getRandomTestValue(type, min, max) {
  switch (type) {
    case 'Number':
      return getRandomInt(min, max);
    case 'String':
      return getRandomString(min, max); 
    default:
      return null;
  }
}

function getRandomTestArray(type, size, min, max, regexPattern) {
  const testArray = [];
  if(regexPattern){
    const randomGenerator = new RandExp(regexPattern);
    for (let i = 0; i < size; i++) {
      let randomValue = randomGenerator.gen();
      if(type == "String"){
        randomValue = `'${randomValue}'`;
      }
      if(type == "Number"){
        randomValue = randomValue.replace(/^0+/,"");
      }
      testArray.push(randomValue);
    }
  }
  else{
    for (let i = 0; i < size; i++) {
      testArray.push(getRandomTestValue(type, min, max));
    }
  }
  return testArray;
}

module.exports = getRandomTestArray;