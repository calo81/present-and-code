var socketio = require('socket.io')
    , fs = require('fs')
    , path = require('path')
    , livePresentations = {}
    , currentCodeForSlideAndPresentation = {}
    , presentsInPresentation = {}
    , problemForSlideAndPresentation = {}


exports.listen = function (server) {
    var io = socketio.listen(server);
    io.set('log level', 1);

    function joinSessionPresentation(socket, name) {
        socket.join(name);
        livePresentations[socket.id] = name;
        if(presentsInPresentation[name]==undefined){
            presentsInPresentation[name] = 0;
            console.log("Creating a new session for the name "+name);
        }
        presentsInPresentation[name]++;
    }

    function leaveSessionPresentation(socket,name){
        socket.leave(name);
        livePresentations[socket.id] = null;
        presentsInPresentation[name]--;
        if(presentsInPresentation[name] < 1){
            console.log("Removing session "+ name + " cause there is noone connected to it.")
            currentCodeForSlideAndPresentation[name] = null;
            problemForSlideAndPresentation[name] = null;
            presentsInPresentation[name] = null;
        }
    }

    function extractCodeForSlidesAndPresentation(name, codeStrings) {
        if (currentCodeForSlideAndPresentation[name] == undefined) {
            currentCodeForSlideAndPresentation[name] = {}
            for (var i = 0; i < codeStrings.length; i++) {
                currentCodeForSlideAndPresentation[name][i] = codeStrings[i].trim();
            }
        }
    }

    function extractProblemForPresentation(name, problemString) {
        if (problemForSlideAndPresentation[name] == undefined) {
            problemForSlideAndPresentation[name] = {html: problemString, code: ""}
        }
    }

    io.sockets.on('connection', function (socket) {

        socket.on('updateCode', function (code, slide) {
            if(!livePresentations[socket.id]) return;
            currentCodeForSlideAndPresentation[livePresentations[socket.id]][slide] = code;
            socket.broadcast.to(livePresentations[socket.id]).emit('codeUpdated', code);
        });

        socket.on('updateProblemCode', function (code, slide) {
            if(!livePresentations[socket.id]) return;
            problemForSlideAndPresentation[livePresentations[socket.id]]["code"] = code;
            socket.broadcast.to(livePresentations[socket.id]).emit('codeUpdated', code);
        });

        socket.on('showProblem', function () {
            if(!livePresentations[socket.id]) return;
            socket.emit('problemShowed', problemForSlideAndPresentation[livePresentations[socket.id]]);
            socket.broadcast.to(livePresentations[socket.id]).emit('problemShowed', problemForSlideAndPresentation[livePresentations[socket.id]]);
        });

        socket.on('showPresentation', function (html,code) {
            if(!livePresentations[socket.id]) return;
            socket.emit('presentationShowed', html,code);
            socket.broadcast.to(livePresentations[socket.id]).emit('presentationShowed', html,code);
        });



        socket.on('changeSlideTo', function (index) {
            if(!livePresentations[socket.id]) return;
            socket.broadcast.to(livePresentations[socket.id]).emit('slideChangedTo', index);
            socket.broadcast.to(livePresentations[socket.id]).
                emit('codeUpdated', currentCodeForSlideAndPresentation[livePresentations[socket.id]][index]);
            socket.emit('codeUpdated', currentCodeForSlideAndPresentation[livePresentations[socket.id]][index]);
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
                leaveSessionPresentation(socket,livePresentations[socket.id])
                joinSessionPresentation(socket, name);
                var dataString = data.toString().split("<!-- SECTION -->");
                var codeStrings = dataString[1].split("<!---->");
                var problemString = dataString[2];
                extractCodeForSlidesAndPresentation(name, codeStrings);
                extractProblemForPresentation(name, problemString);
                socket.broadcast.to(livePresentations[socket.id]).emit('presentationChanged', dataString[0],
                    currentCodeForSlideAndPresentation[name][0]);
                socket.emit('presentationChanged', dataString[0], currentCodeForSlideAndPresentation[name][0]);
            });
        });
    });
};