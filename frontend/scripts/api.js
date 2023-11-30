
class SiteApi {

    constructor() {
        let docUrl = window.location.href
        this.baseurl = docUrl.substring(0, docUrl.lastIndexOf("/") + 1);
    }

    call(api,cb) {
        function contentCallback(content) {
            let retObj = JSON.parse(content);
            cb(retObj);
        }
        let param = "&sessionId=" + _sessionId;
        let uri = this.baseurl + api + param;
        new CantorRequest(uri, contentCallback);
    }
}