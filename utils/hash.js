const  generateHash = (password) => {
    return crypto.createHash('md5').update(password).digest("hex");
  }

 module.exports = {
    generateHash,
 }