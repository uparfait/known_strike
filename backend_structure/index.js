const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connect_db = require('./Connection/index.js');
const Router = require('./Routers/skeleton.1.js');
const log = require('./Utilities/logger.js');
const Clients_router_v1 = require('./Routers/clients.1.js')

const app = express();

const cors_options = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowHeaders: 'Content-Type, Authorization, X-Requested-With'
}

app.use(cors(cors_options));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/cinapi', Router);
app.use('/api/v1', Clients_router_v1);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', success: false });
});

app.use((err, req, res, next) => {
  log(false, 'error', `Error: ${err.message}`);
  res.status(500).json({ error: 'Unexpected Error Occured!', success: false });
});

const APP_PORT = 2025;

async function startServer() {
  await connect_db();
  app.listen(APP_PORT, () => {
    log(true, 'info', `Cinevido Launched on port ${APP_PORT} at ${new Date().toLocaleString()}`);
  });
}

startServer();

module.exports = app;

