const csrf = require('csurf');

const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

module.exports = csrfProtection;
