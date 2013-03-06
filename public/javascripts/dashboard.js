function Dashboard(config) {
    var socket = config.socket
    var codeMirror = config.codeMirror;
    var lastCodeServerUpdate;
    var lastSlideServerUpdate;

    var me = this;

    function comeFromCodeServerUpdate() {
        return codeMirror.getValue() == lastCodeServerUpdate;
    }

    function comeFromSlideServerUpdate(index) {
        return $.deck('current') == index;
    }

    codeMirror.on("change", function (instance, changeObj) {
        if (!comeFromCodeServerUpdate()) {
            socket.emit("updateCode", codeMirror.getValue(), $.deck('current'));
        }
    });

    socket.on('codeUpdated', function (code) {
        lastCodeServerUpdate = code;
        codeMirror.setValue(code);
    });

    socket.on("slideChangedTo", function (index) {
        lastSlideServerUpdate = index;
        $.deck('go', index);
    });

    socket.on("presentationChanged", function (html,code) {
        $(".deck-container").html(html);
        $.deck('.slide');
        addNavigationSupport($, 'deck');
        me.changeSlide(0,0);
        codeMirror.setValue(code)
    });

    this.changeSlide = function (from, to) {
        if (!comeFromSlideServerUpdate(to)) {
            socket.emit("changeSlideTo", to);
        }
    }
}


var dashboard;
$(document).ready(function () {
    var socket = io.connect();
    var codeMirror = CodeMirror.fromTextArea($("#codeArea").get(0), {mode: 'ruby'});
    dashboard = new Dashboard({socket: socket, codeMirror: codeMirror});
    $.deck('.slide');
    $(document).bind('deck.change', function (event, from, to) {
        dashboard.changeSlide(from, to)
    });
    $("#commander").keypress(function (event) {
        if (event.which == 13) {
            socket.emit("getPresentation", $("#commander").val());
        }
    });
});