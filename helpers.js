//helper functions

//generate random ID
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

//check for user specific urls
const specificUrls = function(id, urlDatabase) {
  const urlsForUserDatabase = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      urlsForUserDatabase[key] = urlDatabase[key];
    }
  }
  return urlsForUserDatabase;
};

//check if user created url
const creator = function(cookie, urlDatabase, key) {
  let urlCreator = true;
  if (cookie !== urlDatabase[key].userID) {
    return urlCreator = false;
  }
  return urlCreator;
};

//look up user by email
const getUserByEmail = function(email, userDatabase) {
  for (let user in userDatabase) {
    if (email === userDatabase[user].email) {
      return user;
    }
  }
};
//checks if url contains http if not adds it to url.
const addHTTPS = function(url) {
  if (url.includes(`http://`) || url.includes('https://')) {
    return url;
  } 
  return `https://${url}`;
};




module.exports = {getUserByEmail, generateRandomString, creator, specificUrls, addHTTPS };