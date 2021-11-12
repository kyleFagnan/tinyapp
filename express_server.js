const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); //Set ejs as templating engine

//URL database object
const urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca",
    userID: 'user1'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'user2'
  }
};

//users database object
const users = {
  'user1': {
    id: 'user1',
    email: 'user1@email.com',
    password: 'user1Pass'
  },
  'user2': {
    id: 'user2',
    email: 'user2@email.com',
    password: 'user2Pass'
  }
}

//helper functions

//generate random ID
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

//look up user by email
const findUserByEmail = (usersData, email) => {
  for (const user in usersData) {
    if (email === usersData[user].email) {
      return usersData[user];
    }
  }
};

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





//get requests

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  
  const userID = req.cookies["user_id"];
  const urlsForUserDatabase = specificUrls(userID, urlDatabase);
  const templateVars = { urls: urlsForUserDatabase, user: users[userID] };
  if (userID && !users[userID]) { 
    
    return res.redirect("/register");
  }
  res.render("urls_index", templateVars);
});




//create a tiny URL
app.get("/urls/new", (req, res) => {
  if(!users[req.cookies['user_id']]){
    return res.redirect('/register');
  }
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render("urls_new", templateVars);
});

//info about short URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send("url not found");
  }
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.cookies["user_id"];
  
  const templateVars = {shortURL,user: users['user_id'],longURL,}
  res.render("urls_show", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

//registration page
app.get("/register", (req, res) => {
  const user = users.id;
  const templateVars = {
    user,
  }
  res.render("urls_register", templateVars);
});

//login page
app.get("/login", (req, res) => {
  const userID = req.cookies['user_id'];
  if(userID){
    return res.redirect('/urls')
  };
  const templateVars = {
    user: users[userID]
  }
  res.render('urls_login', templateVars);
})


app.get('/u/:shortURL', (req, res) => {
  const longURL = req.params.shortURL;
  res.redirect(longURL);
});

//post requests

//make a tiny URL
app.post("/urls", (req, res) => {
 const shortRandm = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  urlDatabase[shortRandm] = { longURL, userID };
  
  res.redirect(`/urls/${shortRandm}`);
});
 
 
 
//delete url and return home
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const urlCreator = creator(req.cookies["user_id"], urlDatabase, shortURL);
  if(!urlCreator) {
    return res.status(403).send("Not authorized to delete");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//edit a URL 
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const urlCreator = creator(req.cookies["user_id"], urlDatabase, shortURL);
  if(!urlCreator) {
    return res.status(403).send("Not authorized to edit");
  }
  const longURL = req.body.longURL
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

//Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(users, email);

  //check if user exists
  if(!user){
    return res.status(403).end();
  }
  //compare password
  if(password !== user.password){
    return res.status(403).end();
  }

  res.cookie('user_id', user.id)
  res.redirect('/urls')

});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
})

//add new user to global users object
app.post('/register', (req, res) => {
   const {email, password} = req.body;
  if(password === '' || email === ''){
    return res.status(400).end();
  }

  if (findUserByEmail(users, email)) {
    return res.status(400).end();
  }

  const user = {
    id: generateRandomString(),
    email,
    password,
  }
  users[user.id] = user;
  res.cookie('user_id', user.id);

  console.log('new id', user.id)
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});