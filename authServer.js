const express = require("express");
const jwt = require("jsonwebtoken");
const authServer = express();
const port = 5003;
require("dotenv").config();

authServer.use(express.json());

const refreshTokens = [];

// access token 생성기
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
};

// 로그인
authServer.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const payload = { username, password };
    const accessToken = generateAccessToken(payload);
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "3600000s",
    });
    refreshTokens.push(refreshToken);
    res.status(200).send({ accessToken, refreshToken });
  } catch (err) {
    console.log(err);
  }
});

// refresh token 으로 새로운 access token 요청
authServer.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken === null) {
    res.sendStatus(401);
  } else if (!refreshTokens.includes(refreshToken)) {
    res.sendStatus(403);
  } else {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) {
          console.log("err ==> ", err);
          res.sendStatus(403);
        } else {
          const { username, password } = payload;
          const accessToken = generateAccessToken({ username, password });
          res.status(200).send({ accessToken });
        }
      }
    );
  }
});

authServer.listen(port, () => {
  console.log(`listen on port ${port}`);
});
