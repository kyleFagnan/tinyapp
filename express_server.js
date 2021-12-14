const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const {getUserByEmail, generateRandomString, creator, specificUrls, addHTTPS } = require('./helpers');
const urlDatabase = require('./database/url_database');
const users = require('./database/user_database')

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); //Set ejs as templating engine

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

//get requests

app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

//list of users urls
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const urlsForUserDatabase = specificUrls(userID, urlDatabase);
  const templateVars = { urls: urlsForUserDatabase, user: users[userID] };
  if (!userID) {
    
    return res.status(403).send("Login first");
  }
  res.render("urls_index", templateVars);
});

//create a tiny URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect('/login');
  }
  const templateVars = {user: users[userID]};
  res.render("urls_new", templateVars);
});

//info about short URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  const urlCreator = creator(req.session.userID, urlDatabase, shortURL);
  if (!urlCreator) {
    return res.status(401).send("Not authorized to edit");
  }
  
  if (!urlDatabase[shortURL]) {
    return res.redirect("/not_found");
  }
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session.userID;
  const owner = creator(userID, urlDatabase, shortURL);
  const templateVars = {shortURL,user: users['user_id'],longURL, owner};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//registration page
app.get("/register", (req, res) => {
  const userID = req.session.userID;
  if (userID) return res.redirect('/urls');
  const templateVars = {
    user: users[userID]
  };
  res.render("urls_register", templateVars);
});

//login page
app.get("/login", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[userID]
  };
  res.render('urls_login', templateVars);
});

// redirect to long url
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//post requests

//make a tiny URL
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.status(401).send('401 Unauthorized - Only registered users can create new URLs');
  };
  const shortRandm = generateRandomString();
  const longURL = req.body.longURL;
  
  urlDatabase[shortRandm] = { longURL: addHTTPS(longURL), userID };
  
  res.redirect(`/urls/${shortRandm}`);
});
 
 //delete url and return home
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const urlCreator = creator(req.session.userID, urlDatabase, shortURL);
  if (!urlCreator) {
    return res.status(401).send("Not authorized to delete");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//edit a URL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const urlCreator = creator(req.session.userID, urlDatabase, shortURL);
  if (!urlCreator) {
    return res.status(401).send("Not authorized to edit");
  }
  const newURL = addHTTPS(req.body.newURL);
  urlDatabase[shortURL].longURL = newURL;
  res.redirect('/urls');
});

//Login a user
app.post('/login', (req, res) => {
  const userID = req.session.userID;
  if (userID) return res.redirect("/urls");

  const  email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  //check if user exists in database
  if (!user) {
    return res.status(400).send('Email not found');
  }
  // compare password
  bcrypt.compare(password, users[user].password, (err, success) => {
    
    if (!success) {
      return res.status(403).send("Email or password Error");
    }
    req.session.userID = user;
    res.redirect('/urls');
  });
});

//logout and remove cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//add new user to global users object
app.post('/register', (req, res) => {
  const {email, password} = req.body;
  if (password === '' || email === '') {
    return res.status(400).send('Email or Password Cannot be blank');
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send('???');
  }
  
  //hash plaintext password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      const id = generateRandomString();
      users[id] = { id, email, password: hash };
      req.session.userID = id;
      res.redirect('/urls');
    });
  });
});

//start server listening for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});