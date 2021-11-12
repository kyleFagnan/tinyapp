



//look up user by email
const getUserByEmail = function(email, userDatabase) {
  for (let user in userDatabase) {
    if (email === userDatabase[user].email) {
      return user;
    }
  }
};




module.exports = {getUserByEmail};