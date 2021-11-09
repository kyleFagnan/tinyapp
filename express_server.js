const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs"); //Set ejs as templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);

}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortRandm = generateRandomString();
  urlDatabase[shortRandm] = req.body.longURL;
  res.redirect(`/urls/${shortRandm}`);         // redirect to new page
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});