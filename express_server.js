const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); //Set ejs as templating engine

//database object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//users object
const users = {
  'user1Id': {
    id: 'user1',
    email: 'user1Email',
    password: 'user1Password'
  },
  'user2Id': {
    id: 'user2',
    email: 'user2Email',
    password: 'user2Password'
  }
}


function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);

}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  const templateVars = {shortURL, 
    username: req.cookies.username,
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
  res.render("urls_register");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortRandm = generateRandomString();
  urlDatabase[shortRandm] = req.body.longURL;
  res.redirect(`/urls/${shortRandm}`);         // redirect to new page
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = req.params.shortURL;
  res.redirect(longURL);
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
  const { username } = req.body;
  res.cookie('username', username)
  res.redirect('/urls')

});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
})

//add new user to global users object
app.post('/register', (req, res) => {
  const randomId = generateRandomString();
  
  const newUser = {
    id: randomId,
    email: req.body.email,
    password: req.body.password
  }
  users[newUser.id] = newUser;
  res.cookie('userId', newUser.id);

  console.log('new user object:', users)
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});