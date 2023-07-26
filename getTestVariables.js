function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomTestValue(type) {
  switch (type) {
    case 'Number':
      return getRandomInt(-100, 100);
    case 'String':
      return Math.random().toString(36).substr(2, 10); // Random string of length 10
    case 'Boolean':
      return Math.random() < 0.5;
    default:
      return null;
  }
}

function getRandomTestArray(type, size) {
  const testArray = [];
  for (let i = 0; i < size; i++) {
    testArray.push(getRandomTestValue(type));
  }
  return testArray;
}

module.exports = getRandomTestArray;