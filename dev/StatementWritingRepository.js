function writeNewStatement(...params) {
  console.log('writeNewStatement', params);
}

function changeExistingStatement(...params) {
  console.log('changeExistingStatement', params);
}

module.exports = { writeNewStatement, changeExistingStatement };
