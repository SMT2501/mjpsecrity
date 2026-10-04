'use strict';

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`MJP Security site running on port ${PORT}`);
});
