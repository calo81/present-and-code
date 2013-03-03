function Dashboard(config) {
    var socket = config.socket
    var codeMirror = config.codeMirror;
    var lastServerUpdate;

    function doesntComeFromServerUpdate() {
        return codeMirror.getValue() != lastServerUpdate;
    }

    codeMirror.on("change", function (instance, changeObj) {
        if (doesntComeFromServerUpdate()) {
            socket.emit("updateCode", codeMirror.getValue());
        }
    });

    socket.on('codeUpdated', function (code) {
        lastServerUpdate = code;
        codeMirror.setValue(code);
    });
}


var dashboard;
$(document).ready(function () {
    var socket = io.connect();
    var codeMirror = CodeMirror.fromTextArea($("#codeArea").get(0), {mode: 'ruby'});
    dashboard = new Dashboard({socket: socket, codeMirror: codeMirror});
});