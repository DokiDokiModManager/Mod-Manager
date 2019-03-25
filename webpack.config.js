const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
    entry: "./src/renderer/js/app.js",
    output: {
        path: path.resolve(__dirname, "lib", "renderer", "js"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {test: /\.vue$/, use: "vue-loader"},
            {
                test: /\.css$/,
                use: [
                    "vue-style-loader",
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    devtool: "cheap-source-map"
};