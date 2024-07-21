const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!users.find((user) => user.username === username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User successfully registered." });
    } else {
      return res.status(400).json({ message: "Username already exists." });
    }
  } else {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  return res.status(200).json(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const bookByIsbn = books[isbn];
  if (!bookByIsbn) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(bookByIsbn);
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = decodeURIComponent(req.params.author);
  const booksByAuthor = Object.values(books).filter(
    (book) => book.author === author
  );
  if (booksByAuthor.length < 0) {
    res.status(404).json({ message: "No books found by this author" });
  }
  return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = decodeURIComponent(req.params.title);
  const booksByTitle = Object.values(books).filter(
    (book) => book.title === title
  );
  if (booksByTitle < 0) {
    return res.status(404).json({ message: "No books found by this title" });
  }
  return res.status(200).json(booksByTitle);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const bookByIsbn = books[isbn];
  if (!bookByIsbn) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(bookByIsbn.reviews);
});

async function getBooks() {
  try {
    const response = await axios.get("http://localhost:5000");
    return response.data;
  } catch (error) {
    return console.error("Error fetching books:", error);
  }
}

async function getBookByIsbn(isbn) {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    return console.error("Error fetching books:", error);
  }
}

async function getBookByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return response.data;
  } catch (error) {
    return console.error("Error fetching books:", error);
  }
}

async function getBookByTitle(title) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return response.data;
  } catch (error) {
    return console.error("Error fetching books:", error);
  }
}
module.exports.general = public_users;
