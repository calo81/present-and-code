var socketio = require('socket.io')
    , fs = require('fs')
    , path = require('path')
    , livePresentations = {}


exports.listen = function (server) {
    var io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        socket.on('updateCode', function (code) {
            socket.broadcast.emit('codeUpdated', code);
        });

        socket.on('changeSlideTo', function (index) {
            socket.broadcast.emit('slideChangedTo', index);
        });

        socket.on('getPresentation', function(name){
            fs.readFile('./public/presentations/'+name,function(err, data) {
                var dataString = data.toString();
                socket.broadcast.emit('presentationChanged', dataString);
                socket.emit('presentationChanged', dataString);
            });
        });
    });
};