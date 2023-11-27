const bcrypt = require("bcrypt");
async function comparePasswords(userEntered, dbSaved) {
    const result = await bcrypt.compare(userEntered, dbSaved);
    return result;
  }

  module.exports = {
    comparePasswords,
    
  };