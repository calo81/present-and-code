var http = require('http')
    , fs = require('fs')
    , path = require('path')
    , mime = require('mime')
    , formidable = require('formidable')
    , util = require('util')
    , cache = {};

function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
}

function handleFileUpload(req, res) {
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, files) {
            console.log(fields["name"]);
            fs.rename(files.upload_presentation.path, './public/presentations/'+fields["name"], function(err) {
                if (err) throw err;
            });
            res.setHeader('Location', "/");
            res.statusCode = 302;
            res.end();
        });

        return;
    }
}

var server = http.createServer(function (request, response) {
    var filePath = false;
    if (request.url == '/') {
        filePath = 'public/index.html';
    }else if (request.url == '/upload'){
        handleFileUpload(request, response);
        return;
    } else {
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

var port = process.env.PORT || 3001
server.listen(port, function () {
    console.log("Server listening on port." + port);
});

var dashboardServer = require('./lib/dashboard_server');
dashboardServer.listen(server);