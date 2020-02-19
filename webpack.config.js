const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// needed so that baseUrl in tsconfig.json is used to determine whereabouts of modules
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal ? 'cheap-module-eval-source-map' : 'nosources-source-map',
  resolve: {
    extensions: ['.mjs', '.json', '.ts', '.js'], // must include extensions of files of referenced modules in node_modules
    symlinks: false,
    cacheWithContext: false,
    plugins: [new TsconfigPathsPlugin()]
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',

  // we explicitly exclude aws-sdk just incase we use a non dev module that transitively includes aws-sdk
  // we dont excude nodeExternals() because we are currently setting up to perform tree shaking of dependent modules
  externals: ['source-map-support/register', 'aws-sdk'],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        include: [
          path.resolve(__dirname, 'src')
        ]
      },
    ],
  },
  plugins: [
    // new ForkTsCheckerWebpackPlugin({
    //   eslint: true,
    //   eslintOptions: {
    //     cache: true
    //   }
    // })
    
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(
       {
         terserOptions: {
           mangle: true,
           output: {
             comments: false
           }
         }, 
        sourceMap: true
      })
    ]
  }  
};
