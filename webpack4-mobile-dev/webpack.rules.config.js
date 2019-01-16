const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/**
 * @param [Boolean] isProd 是否是线上打包
 */
module.exports = function (isProd) {
    var rules = [{
            test: /\.js$/,
            exclude: "/node_modules/",
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['es2015-loose']
                }
            }
        },
        {
            test: /\.style$/,
            use: ['style-loader', 'css-loader', 'less-loader',
                //  {
                //     loader: 'postcss-loader',
                //     options: {
                //         parser: 'postcss-js',
                //         exec: true
                //     }
                // }
            ]
        },
        {
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader']
        },
        {
            test: /\.(scss|sass)$/,
            use: ["style-loader", "css-loader", "sass-loader"]
        },
        {
            test: /\.(gif|jpg|jpeg|png|svg)\??.*$/,
            use:[{
                loader:"file-loader",
                options:{
                    name:"[hash].[ext]",
                    publicPath:"/assets/images/",
                    outputPath:"/assets/images/"
                }
            }]
        },
        {
            test: /\.(woff|svg|eot|ttf)\??.*$/,
            use: 'url-loader?limit=700&name=fonts/[hash].[ext]'
        },
        {
            test: /\.html$/,
            use: 'html-loader'
        },
        {
            test: /\.tpl$/,
            use: 'ejs-loader'
        }

    ]

    if (isProd) {
        rules.push({
            test: /\.css$/,
            use: [{
                loader: MiniCssExtractPlugin.loader
            }, 'css-loader']
        })

    } else {
        rules.push({
            test: /\.css$/,
            use: ['style-loader','css-loader']
        })

    }
    return rules;
}