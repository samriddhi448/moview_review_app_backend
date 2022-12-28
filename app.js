const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
require('./db');
require('express-async-errors');
const userRouter = require('./routes/user');
const cors = require('cors');
const {errorHandler} = require('./middlewares/error');
const { handleNotfound } = require('./utils/helper');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(errorHandler)
// MVC - Modal View Controller

// app.post("/sign-in",
// (req, res, next) => {
//   const {email, password} = req.body;
//   if(!email || !password) return res.json({error: 'Email/Password cannot be empty!'});
//   next();
// },
// (req, res) => {
//   res.send("from abouttt")
// }
// )

app.use('/api/user',userRouter);

app.use('/*',handleNotfound);


app.get('/about', (req, res) => {
  res.send('<h1> Hello I am from your backend about');
})

app.listen(8000, () => {
  console.log('the app is listening on http://localhost:8000');
})