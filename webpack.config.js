const path = require("path");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: "./src/renderer/js/app.ts",
    output: {
        path: path.resolve(__dirname, "lib", "renderer", "js"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {test: /\.vue$/, use: "vue-loader"}
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};