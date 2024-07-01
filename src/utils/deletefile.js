const fs = require("fs");
const deletefile = (url) => {
  fs.unlink(url, (err) => {
    if (err) {
      throw err;
    }
  });
};
module.exports = deletefile;
