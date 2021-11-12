



//look up user by email
const findUserByEmail = (usersData, email) => {
  for (const user in usersData) {
    if (email === usersData[user].email) {
      return usersData[user];
    }
  }
};




module.exports = {findUserByEmail};