var httpProxy = require('http-proxy')

var proxy = httpProxy.createProxy();

var options = {
    'pled.com': 'http://localhost:8888'
}

require('http').createServer(function(req, res) {
    proxy.web(req, res, {
        target: options[req.headers.host]
    });
}).listen(8080);