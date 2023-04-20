
class CantorObject
{
    _elm = null;
    _isSet = false;
    _parent = null;
    constructor(id,pa)
    {
        let ty = typeof id;
        if(pa == null)
        {
            this._parent = document;
        }
        else
        {
            this._parent = pa;
        }
        if(ty == 'string')
        {
            if(id.startsWith('#'))
            {
                this._elm = this._parent.getElementById(id.substring(1));
                this._isSet = HTMLCollection.prototype.isPrototypeOf(this._elm);
            }
            else
            {
                this._elm = this._parent.getElementsByTagName(id);
                this._isSet = HTMLCollection.prototype.isPrototypeOf(this._elm);
            }
        }
        else
        {
            this._elm = id;
            this._isSet = HTMLCollection.prototype.isPrototypeOf(this._elm);
        }
    }
    set(attrName,val)
    {
        if(this._isSet)
        {
            for(const i in this._elm)
            {
                this._elm[i].setAttribute(attrName,val);
            }
        }
        else
        {
            this._elm.setAttribute(attrName,val);
        }
    }
    get(attrName)
    {
        return this._elm.getAttribute(attrName);
    }
    removeClass(clsName)
    {
        if(this._isSet)
        {
            for(const i in this._elm)
            {
                var obj = this._elm[i];
                var objClsName = obj.className;
                if(objClsName!=null)
                {
                    obj.className = objClsName.replace(" "+clsName, "");
                }
            }
        }
        else
        {
            var objClsName = this._elm.className;
            if(objClsName!=null)
            {
                this._elm.className = objClsName.replace(" "+clsName, "");
            }
    }        
    }
    addClass(clsName)
    {
        if(this._isSet)
        {
            for(const i in this._elm)
            {
                obj.className +=" "+clsName;
            }
        }
        else
        {
            this._elm.className +=" "+clsName;
        }        
    }
}
function $(id,pa=null)
{
    return new CantorObject(id,pa);
}
function nodeScriptReplace(node) 
{
    if ( nodeScriptIs(node) === true ) 
    {
        node.parentNode.replaceChild( nodeScriptClone(node) , node );
    }
    else 
    {
        var i = -1, children = node.childNodes;
        while ( ++i < children.length ) 
        {
                nodeScriptReplace( children[i] );
        }
    }  
    return node;
}
function nodeScriptClone(node)
{
        var script  = document.createElement("script");
        script.text = node.innerHTML;
        var i = -1, attrs = node.attributes, attr;
        while ( ++i < attrs.length ) 
        {                                    
            script.setAttribute( (attr = attrs[i]).name, attr.value );
        }
        return script;
}

function nodeScriptIs(node) 
{
        return node.tagName === 'SCRIPT';
}


class CantorCache
{
    _content = null;
    _ts = null;
    constructor(content)
    {
       this._content = content;
       this._ts = Date.now();
    }
}
class CantorRequest
{
    _url = null;
    _cachedObj = null;
    _cb = null;//callback

    constructor(url,cb)
    {
        this._cb = cb;
        let self = this;
        function reqListener () 
        {
            self._cachedObj._content = this.responseText;
            if(self._cb)
            {
                self._cb(self._cachedObj._content);
            }
        }
        function reqTimeout(e)
        {

        }
        var dict = window["CantorRequest_cache"];
        if( dict == null)
        {
            dict ={};
            window["CantorRequest_cache"] =dict;
        }
        this._cachedObj = dict[url];
        if( this._cachedObj == null)
        {
            this._cachedObj = new CantorCache();
            dict[url] = this._cachedObj;
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListener);
            oReq.addEventListener("timeout ", reqTimeout);
            oReq.open("GET", url);
            oReq.send();
        }
        else if(cb)
        {
            cb(this._cachedObj._content);
        }
    }
}


class CantorPanelImpl extends HTMLElement  
{
    ContentInsideFullHtmlDoc = false;
    static get observedAttributes() { return ['src']; }

    attributeChangedCallback(attrName, oldVal, newVal) 
    {
        this[attrName] = newVal;
        if(attrName =="src")
        {
            this.loadFromContent();
        }
    }
    loadFromContent()
    {
        let self = this;

        function contentCallback(content) 
        {
            if(self.ContentInsideFullHtmlDoc)
            {
                self.innerHTML = content;
                nodeScriptReplace(self);
            }
            else
            {
                self.innerHTML = content;
            }

        }
        let docUrl = window.location.href
        let url = docUrl.substring( 0, docUrl.lastIndexOf( "/" ) + 1);
        let src_url = this.getAttribute('src');
        if(src_url==null)
        {
            return;
        }
        if(src_url.endsWith(".html"))
        {
            this.ContentInsideFullHtmlDoc = true;
        }
        let full_url = url+src_url;
        new CantorRequest(full_url,contentCallback);
    }
    connectedCallback()
    {
        this.loadFromContent();
    }

}
customElements.define('cantor-panel', CantorPanelImpl);
                    