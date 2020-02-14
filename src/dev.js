require('dotenv').config();

const {handler} = require('./index');

const mockResponse = {
  sendStatus: (status) => console.log('Responded with status', status),
};

handler(null, mockResponse)
    .catch((err) => console.error('Something went wrong', err));
