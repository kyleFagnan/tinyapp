



//look up user by email
const getUserByEmail = function(email, userDatabase) {
  for (let user in userDatabase) {
    if (email === userDatabase[user].email) {
      return user;
    }
  }
};

//add http:// 
const addHTTPS = function(url) {
  if (url.substring(0,8) !== "http://") {
    return ("http://").concat(url);
  }
  return url;
};




module.exports = {getUserByEmail, addHTTPS};