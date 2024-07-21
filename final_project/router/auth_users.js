const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  const minLength = 3;
  const maxLength = 16;
  const validChars = /^[a-zA-Z0-9_]+$/;
  const startsWithLetter = /^[a-zA-Z]/;

  if (username.length < minLength || username.length > maxLength) {
    return false;
  }

  if (!validChars.test(username)) {
    return false;
  }

  if (!startsWithLetter.test(username)) {
    return false;
  }

  return true;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return false;
  }

  return true;
};

// regd_users.get("/", (req, res) => {
//   const token = req.headers["authorization"]?.split(" ")[1];

//   return res.status(200).json({
//     users,
//     token,
//   });
// });

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign({ username }, "your_jwt_secret", {
    expiresIn: "1h",
  });

  return res
    .status(200)
    .json({ message: "Login successful", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.verify(token, "your_jwt_secret");

  const username = decoded.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { isbn } = req.params;
  const { review } = req.body;

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(token, "your_jwt_secret");
  const username = decoded.username;

  const { isbn } = req.params;

  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
