const store = require('../store')
const merge = require('webpack-merge')

/**
 * Merge project config and convert to webpack readable config object
 *
 * Set `process.env.NODE_ENV` and `process.env.PANGOLIN_ENV`
 * so environment based configuration will work correctly
 *
 * @param {string} context Project directory
 * @returns {Object} webpack config object
 */
module.exports = function (context) {
  let defaultConfig

  if (process.env.PANGOLIN_ENV === 'dev') {
    defaultConfig = require('./dev')(context)
  }

  if (process.env.PANGOLIN_ENV.startsWith('build')) {
    defaultConfig = require('./build')(context)
  }

  // Apply project chain settings
  if (typeof store.config.chain === 'function') {
    store.config.chain(defaultConfig)
  }

  // Convert webpack-chain into webpack config object
  let webpackConfig = defaultConfig.toConfig()

  // Mutate webpack config in case project config is a function
  if (typeof store.config.configure === 'function') {
    store.config.configure(webpackConfig)
  }

  // Merge project config in case it's an object
  if (typeof store.config.configure === 'object') {
    webpackConfig = merge(webpackConfig, store.config.configure)
  }

  return webpackConfig
}
