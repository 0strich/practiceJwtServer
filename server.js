const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = 5002;
require("dotenv").config();

app.use(express.json());

// token 인증 미들웨어
const tokenAuthmiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  const pack = (status, message) => {
    res.statusCode = status;
    req.tokenDec = message;
  };

  if (token === null) {
    pack(401, { tokenMissing: "not exist token" });
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        pack(403, { Error: err });
      } else {
        pack(200, { payload });
      }
    });
  }
  next();
};
app.get("/posts", tokenAuthmiddleware, (req, res) => {
  res.send(req.tokenDec);
});

app.listen(port, () => {
  console.log(`listen on port ${port}`);
});
