class w {
    static query(selector) {
        var elements = document.querySelectorAll(selector);
        return elements;
    };

    static first(selector) {
        let result = this.query(selector);
        return result[0];
    }

    static ready(fn) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    };

    static get(url, onSuccess, onError) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = () => onSuccess(request.status, JSON.parse(request.responseText));
        request.onerror = onError;
        request.send();
    }

    static render(template, data, parent) {
        const result = ejs.render(template, data);
        parent.innerHTML = result;
    }
}