/* eslint import/no-unresolved: off, import/no-self-import: off */
require('@babel/register');

process.env.NODE_ENV = 'development';
module.exports = require('./webpack.config.renderer.dev.babel').default;
