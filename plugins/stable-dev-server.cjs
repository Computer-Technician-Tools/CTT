/**
 * Keep Docusaurus development mode reliable on Windows.
 *
 * Webpack's CSS hot-replacement runtime can fail with "factory is undefined"
 * in this project. File changes still refresh the browser, but they do so with
 * a normal page reload instead of injecting a partially updated CSS module.
 */
module.exports = function stableDevServerPlugin() {
  return {
    name: 'ctt-stable-dev-server',
    configureWebpack(_config, isServer) {
      if (isServer) return {};

      return {
        // The default eval-cheap-module-source-map wraps every module in
        // development eval/source-map payloads. This project has a large
        // documentation graph, so disable those payloads while keeping normal
        // development mode and its React warnings/behavior.
        devtool: false,
        devServer: {
          hot: false,
          liveReload: true,
          // Avoid reusing old development chunks after a compiler/configuration
          // change. Production files retain their normal cache strategy.
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        },
      };
    },
  };
};
