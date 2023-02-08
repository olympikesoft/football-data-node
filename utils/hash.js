const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function comparePassword(plainPassword, hashedPassword) {
   const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
   return isMatch;
 }

 module.exports = {
   hashPassword,
   comparePassword,
 }