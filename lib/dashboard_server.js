var socketio = require('socket.io')
    , fs = require('fs')
    , path = require('path')
    , livePresentations = {}
    , currentCodeForSlideAndPresentation = {}


exports.listen = function (server) {
    var io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        socket.on('updateCode', function (code, slide) {
            currentCodeForSlideAndPresentation[livePresentations[socket.id] + slide] = code;
            socket.broadcast.to(livePresentations[socket.id]).emit('codeUpdated', code);
        });

        socket.on('changeSlideTo', function (index) {
            socket.broadcast.to(livePresentations[socket.id]).emit('slideChangedTo', index);
            socket.broadcast.to(livePresentations[socket.id]).
                emit('codeUpdated', currentCodeForSlideAndPresentation[livePresentations[socket.id] + index]);
            socket.emit('codeUpdated', currentCodeForSlideAndPresentation[livePresentations[socket.id] + index]);
        });

        /**
         * Expect name parameter in the form session/presentation.
         * Where session is any random name choosen by people that want to be in the same session
         */
        socket.on('getPresentation', function (name) {
            fs.readFile('./public/presentations/' + name.split("/")[1], function (err, data) {
                if (err) {
                    return console.dir(err);
                }
                socket.leave(livePresentations[socket.id]);
                livePresentations[socket.id] = name;
                socket.join(name);

                var dataString = data.toString().split("<!-- CODE -->");
                var codeStrings = dataString[1].split("<!---->");
                if (!currentCodeForSlideAndPresentation[name + 0]) {
                    for (var i = 0; i < codeStrings.length; i++) {
                        currentCodeForSlideAndPresentation[name+i] = codeStrings[i].trim();
                    }
                }
                socket.broadcast.to(livePresentations[socket.id]).emit('presentationChanged', dataString[0], currentCodeForSlideAndPresentation[name+0]);
                socket.emit('presentationChanged', dataString[0], currentCodeForSlideAndPresentation[name+0]);
            });
        });
    });
};