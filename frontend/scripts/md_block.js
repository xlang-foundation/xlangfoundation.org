import { marked } from '../lib/markedjs/src/marked.js';

class MarkdownBlocklImpl extends HTMLElement {
    static get observedAttributes() { return ['src']; }

    attributeChangedCallback(attrName, oldVal, newVal) {
        this[attrName] = newVal;
        if (attrName == "src") {
            this.loadFromContent();
        }
    }
    loadFromContent() {
        let self = this;

        function contentCallback(content) {
            self.innerHTML = marked.parse(content);
        }
        let src_url = this.getAttribute('src');
        if (src_url == null) {
            return;
        }
        let full_url = "";
        if (src_url.indexOf("http") == 0) {
            full_url = src_url;
        }
        else {
            let docUrl = window.location.href
            let url = docUrl.substring(0, docUrl.lastIndexOf("/") + 1);

            full_url = url + src_url;
        }
        new CantorRequest(full_url, contentCallback);
    }
    connectedCallback() {
        this.loadFromContent();
    }

}
customElements.define('md-block', MarkdownBlocklImpl);
