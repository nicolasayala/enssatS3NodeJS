
function post(url, data, async) {
    if(typeof async === "undefined") async=false;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, async);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
}
