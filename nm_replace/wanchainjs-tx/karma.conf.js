process.env.ethTest = 'TransactionTests'

module.exports = function (config) {
  config.set({
    browserNoActivityTimeout: 60000,
    frameworks: ['browserify', 'detectBrowsers', 'tap'],
    files: [
      './test/api.js'
      // TODO: Fix ethereumjs-tests './test/transactionRunner.js'
    ],
    preprocessors: {
      'test/*.js': ['browserify', 'env']
    },
    singleRun: true,
    plugins: [
      'karma-browserify',
      'karma-env-preprocessor',
      'karma-tap',
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-safari-launcher',
      'karma-detect-browsers'
    ],
    detectBrowsers: {
      enabled: true,
      usePhantomJS: false
    }
  })
}
