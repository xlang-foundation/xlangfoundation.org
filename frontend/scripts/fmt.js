var $textarea;
var $highlight;

window.addEventListener('load', function () {
    $textarea = document.getElementById('textarea-input');
    $highlight = document.getElementById('highlight-area');

    var code = `print("test code")`;

    var triggerHighlight = function () {
        var tokens = tokenize($textarea.value);
        $highlight.innerHTML = '';
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            var span = document.createElement('span');
            span.className = 'highlight-' + token.type;
            span.innerText = token.value;
            $highlight.appendChild(span);
        }
        var lines = $textarea.value.split('\n');
        if (lines[lines.length - 1] === '') {
            var br = document.createElement('br');
            $highlight.appendChild(br);
        }
        $highlight.scrollTop = $textarea.scrollTop;
    };

    $textarea.addEventListener('input', triggerHighlight);
    $textarea.addEventListener('scroll', function (event) {
        $highlight.scrollTop = this.scrollTop;
    });

    var tabCode = 9;
    var leftParenthesisCode = 40;
    $textarea.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case tabCode:
                event.preventDefault();
                this.value += '    ';
                break;
        }
    });

    $textarea.textContent = code;
    $highlight.textContent = code;
    triggerHighlight()
});
