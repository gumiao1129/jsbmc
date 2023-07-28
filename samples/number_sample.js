function findSquareRoot(number) {
  if (number < 0) {
    return NaN; // Square root of a negative number is not real
  }

  let low = 0;
  let high = number;
  let precision = 0.0001;
  let mid, square;

  while (high - low > precision) {
    mid = (low + high) / 2;
    square = mid * mid;

    if (square === number) {
      return mid; // Found the exact square root
    } else if (square < number) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Return the approximation of square root
  return Math.floor((low + high) / 2);
}

function check(Number){
  assert(findSquareRoot(Number) == Math.floor(Math.sqrt(Number)));
}

module.exports = { findSquareRoot };