const { DefinePlugin } = require('webpack');

const assetPrefix = process.env.NODE_ENV === 'production' ? '/rxviz' : '';

module.exports = {
  assetPrefix: assetPrefix,
  webpack: config => {
    config.plugins.push(
      new DefinePlugin({
        'process.env.ASSET_PREFIX': JSON.stringify(assetPrefix)
      })
    );

    return config;
  },
  exportPathMap: () => ({
    '/': { page: '/' },
    '/sandbox': { page: '/sandbox' },
    '/404': { page: '/404' }
  })
};
