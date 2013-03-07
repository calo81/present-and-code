function Dashboard(config) {
    var socket = config.socket
    var codeMirror = config.codeMirror;
    var lastCodeServerUpdate;
    var lastSlideServerUpdate;
    var slidesHtml;
    var firstSlideCode;
    var inProblem = false;

    var me = this;

    function comeFromCodeServerUpdate() {
        return codeMirror.getValue() == lastCodeServerUpdate;
    }

    function comeFromSlideServerUpdate(index) {
        return $.deck('current') == index;
    }

    function updateContainers(html, code) {
        $(".deck-container").html(html);
        $.deck('.slide');
        addNavigationSupport($, 'deck');
        me.changeSlide(0, 0);
        codeMirror.setValue(code)
    }

    function setPresentation(html, code) {
        slidesHtml = html;
        firstSlideCode = code;
        updateContainers(html, code);
    }

    codeMirror.on("change", function (instance, changeObj) {
        if (!comeFromCodeServerUpdate()) {
            if (inProblem) {
                socket.emit("updateProblemCode", codeMirror.getValue());
            } else {
                socket.emit("updateCode", codeMirror.getValue(), $.deck('current'));
            }
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

    socket.on("problemShowed", function (data) {
        inProblem = true;
        updateContainers(data.html, data.code);
    });

    socket.on("presentationChanged", function (html, code) {
        inProblem = false;
        setPresentation(html, code);
    });

    socket.on("presentationShowed", function (html, code) {
        inProblem = false;
        setPresentation(html, code);
    });

    this.changeSlide = function (from, to) {
        if (!comeFromSlideServerUpdate(to)) {
            socket.emit("changeSlideTo", to);
        }
    }

    this.showProblem = function () {
        socket.emit("showProblem");
    }

    this.showPresentation = function () {
        socket.emit("showPresentation", slidesHtml, firstSlideCode);
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
    $("#problemButton").click(function () {
        dashboard.showProblem();
    });

    $("#presentationButton").click(function () {
        dashboard.showPresentation();
    });


});