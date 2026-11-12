const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const httpProxy = require('http-proxy');
const jwt = require('jsonwebtoken');

const app = express();
const proxy = httpProxy.createProxyServer({});

// DO NOT add express.json() here. http-proxy needs the unparsed raw request stream.

// Handle proxy errors gracefully (prevents gateway crashes if downstream microservices are down)
proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err.message);
  if (!res.headersSent) {
    res.status(502).json({ message: 'Bad Gateway: Microservice unreachable' });
  }
});

const JWT_SECRET = process.env.JWT_SECRET;
const REGISTER_SERVICE_HOST = process.env.REGISTER_SERVICE_HOST || 'localhost';
const REGISTER_SERVICE_PORT = process.env.REGISTER_SERVICE_PORT || '5001';
const DELETE_SERVICE_HOST = process.env.DELETE_SERVICE_HOST || 'localhost';
const DELETE_SERVICE_PORT = process.env.DELETE_SERVICE_PORT || '5000';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// Middleware: Authenticate JWT Token
function authToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
    }
    req.user = user;
    next();
  });
}

// Middleware: Authorize Role
function authRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `Access Forbidden: Requires '${role}' permissions` });
    }
    next();
  };
}

// 1. REGISTER ROUTE (Public) -> Target: Port 5001 (Registration Service)
app.use('/register', (req, res) => {
  console.log('[Gateway] Routing to Register Service');
  proxy.web(req, res, { target: `http://${REGISTER_SERVICE_HOST}:${REGISTER_SERVICE_PORT}` });
});

// 2. DELETE ROUTE -> Target: Port 5000 (Delete Student Service)
app.use('/delete', (req, res) => {
  console.log('[Gateway] Routing to Delete Service');
  proxy.web(req, res, { target: `http://${DELETE_SERVICE_HOST}:${DELETE_SERVICE_PORT}` });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API Gateway Service is running on PORT NO : ${PORT}`);
});