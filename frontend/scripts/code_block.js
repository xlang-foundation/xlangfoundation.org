//https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-customized-builtin-example
/*
 * Trying to use a customized built-in element as an autonomous custom 
 * element will not work; that is, <plastic-button>Click me?</plastic-button> 
 * will simply create an HTMLElement with no special behavior.
 */
//https://stackoverflow.com/questions/50382165/html-custom-element-slot-content-appended-after-shadow-root
//https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow

class CodeBlockImpl extends HTMLElement
{
    code_input_element = null;
    grammar_element = null;
    attributeChangedCallback(attrName, oldVal, newVal)
    {
        this[attrName] = newVal;
        //if (attrName == "src") {
        //    this.loadFromContent();
        //}
    }

    AlignCode(code)
    {
        var lines = code.split('\n');
        //find first non-empty line
        var pre_space = 0;
        var pre_tab = 0;
        for (let i = 0; i < lines.length; i++) {
            var line = lines[i];
            var line_0 = line.replaceAll('\t', '');
            line_0 = line_0.replaceAll(' ', '');
            if (line_0.length > 0) {
                for (let j = 0; j < line.length; j++) {
                    let ch = line.charAt(j);
                    if (ch != ' ' && ch != '\t') {
                        break;
                    }
                    if (ch == ' ') {
                        pre_space++;
                    }
                    else if (ch == '\t') {
                        pre_tab++;
                    }
                }
                break;
            }
        }
        code = "";
        for (let i = 0; i < lines.length; i++) {
            var line = lines[i];
            let pos = 0;
            let space_removed = 0;
            let tab_removed = 0;
            for (let j = 0; j < line.length; j++) {
                let ch = line.charAt(j);
                if (ch != ' ' && ch != '\t') {
                    break;
                }
                if (ch == ' ' && space_removed < pre_space) {
                    space_removed++;
                    pos++;
                }
                else if (ch == '\t' && tab_removed < pre_tab) {
                    tab_removed++;
                    pos++;
                }
            }
            if (pos > 0) {
                line = line.substring(pos);
            }
            code += line + "\n";
        }
        return code;
    }
    buildBlock()
    {
        this.innerText = "";
        var div_container = document.createElement("div");
        this.appendChild(div_container);
        //create textarea for code editing
        var textarea_o = document.createElement("textarea");
        textarea_o.wrap = "soft";
        textarea_o.spellcheck = false;
        div_container.appendChild(textarea_o);
        //pre for code syntax show
        var pre_o = document.createElement("pre");
        div_container.appendChild(pre_o);
        //div for output
        var div_output = document.createElement("div");
        div_output.className += "output";
        div_output.innerHTML = "<h1>output</h1>";
        div_container.appendChild(div_output);

        div_container.className += "content-box";

        this.code_input_element = textarea_o;
        this.grammar_element = pre_o;

        let self = this;
        function triggerGrammarBuild()
        {
            var inputEle = self.code_input_element;
            var grammarEle = self.grammar_element;

            var tokens = tokenize(inputEle.value);
            grammarEle.innerHTML = '';
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                var span = document.createElement('span');
                span.className = 'highlight-' + token.type;
                span.innerText = token.value;
                grammarEle.appendChild(span);
            }
            var lines = inputEle.value.split('\n');
            if (lines[lines.length - 1] === '') {
                var br = document.createElement('br');
                grammarEle.appendChild(br);
            }
            grammarEle.scrollTop = inputEle.scrollTop;
        };
        textarea_o.addEventListener('input', triggerGrammarBuild);
        textarea_o.addEventListener('scroll', function (event)
        {
            pre_o.scrollTop = this.scrollTop;
        });

        var tabCode = 9;
        var leftParenthesisCode = 40;
        textarea_o.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                case tabCode:
                    event.preventDefault();
                    this.value += '    ';
                    break;
            }
        });

        var code_obj = this.previousElementSibling;
        if (code_obj != null && code_obj.className =='code_embed') {
            var code = code_obj.textContent;
            code = this.AlignCode(code);
            textarea_o.textContent = code;
            pre_o.textContent = code;
            code_obj.parentNode.removeChild(code_obj);
        }
        triggerGrammarBuild()
    }
    connectedCallback()
    {
        this.buildBlock();
    }
}
customElements.define('code-block', CodeBlockImpl);

