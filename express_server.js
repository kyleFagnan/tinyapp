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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


//get requests

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//create a tiny URL
app.get("/urls/new", (req, res) => {
  if(!users[req.cookies['user_id']]){
    return res.redirect('/register');
  }

  const user = users.id;
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  const templateVars = {shortURL, 
    user: users[req.cookies['user_id']],
    longURL: urlDatabase[shortURL]};

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
  const user = users.id;
  const templateVars = {
    user,
  }
  res.render('urls_login', templateVars);
})


app.get('/u/:shortURL', (req, res) => {
  const longURL = req.params.shortURL;
  res.redirect(longURL);
});

//post requests


app.post("/urls", (req, res) => {
 const shortRandm = generateRandomString();
  urlDatabase[shortRandm] = req.body.longURL;
  res.redirect(`/urls/${shortRandm}`);        
});

//delete url and return home
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//edit a URL 
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
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