const express = require('express');
const cors = require('cors');
const { randomBytes } = require('crypto');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.reqId = randomBytes(4).toString('hex');
  res.setHeader('X-Request-Id', req.reqId);
  next();
});

app.use('/bfhl', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `No route matched ${req.method} /bfhl${req.path}` });
});

app.use((err, req, res, next) => {
  console.error(`[${req.reqId}]`, err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server',
    reqId: req.reqId,
  });
});

module.exports = app;
