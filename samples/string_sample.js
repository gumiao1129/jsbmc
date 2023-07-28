function search_eel(s) {
    const len = s.length;
  
    if (len < 3) {
      return len; // not found
    }
  
    let seen = 0;
  
    for (let i = 0; i < len; i++) {
      const ch = s[i];
  
      if (seen === 0 && ch === 'e') {
        seen = 1;
      } else if (seen === 1 && ch === 'e') {
        seen = 2;
      } else if (seen === 2 && ch === 'l') {
        return i - 2; // found
      } else {
        seen = 0; // reset
      }
    }
  
    return len; // not found
  }
  
  function search_eel_brute(s) {
    const len = s.length;
  
    if (len < 3) {
      return len; // not found
    }
  
    for (let i = 0; i < len - 2; i++) {
      if (s[i] === 'e' && s[i + 1] === 'e' && s[i + 2] === 'l') {
        return i;
      }
    }
  
    return len; // not found
  }

  function check(String){
    assert(search_eel(String) == search_eel_brute(String));
  }

  module.exports = { search_eel, search_eel_brute};