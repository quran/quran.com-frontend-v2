const { environment } = require('@rails/webpacker')
const coffee =  require('./loaders/coffee')
const typescript =  require('./loaders/typescript')
const webpack = require('webpack')
environment.loaders.prepend('typescript', typescript)

/**
 * Automatically load modules instead of having to import or require them everywhere.
 * Support by webpack. To get more information:
 *
 * https://webpack.js.org/plugins/provide-plugin/
 * http://j.mp/2JzG1Dm
 */

environment.plugins.prepend(
    'Provide',
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        Popper: ['popper.js', 'default']
    })
)

/**
 * Expose $ To use jQuery in views
 */
environment.loaders.append('expose', {
    test: require.resolve('jquery'),
    use: [{
        loader: 'expose-loader',
        options: '$'
    }]
})

environment.loaders.prepend('coffee', coffee)
module.exports = environment