const babelRegister = require('babel-core/register');

babelRegister({
    presets: [
        ['env', {
            targets: {
                node: 'current'
            },
            loose: true
        }]
    ]
});
