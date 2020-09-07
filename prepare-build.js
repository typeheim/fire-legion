const rimraf = require('rimraf')

Promise.all([
    new Promise((resolve, reject) => {
        rimraf('./packages/**/*.js', function(e) {
            console.log('Removed JS files')
            resolve()
        })
    }),
    new Promise((resolve, reject) => {
        rimraf('./packages/**/*.d.ts', function(e) {
            console.log('Type definitions removed')
            resolve()
        })
    }),
    new Promise((resolve, reject) => {
        rimraf('./packages/**/*.js.map', function(e) {
            console.log('Map files removed')
            resolve()
        })
    }),
])



