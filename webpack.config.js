const path = require('path');

module.exports = {
    entry: {
        index: path.join(__dirname, '/res/js/index.jsx')
    },
    output: {
        path: path.join(__dirname, '/res/js'),
        filename: '[name].bundle.js'
    },
    devtool: 'source-map',
    mode: 'development',
    watch: true,
    module: {
        rules: [
            { 
                test: /\.jsx$/, 
                exclude: /node_modules/, 
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            }
        ]
    },
};
