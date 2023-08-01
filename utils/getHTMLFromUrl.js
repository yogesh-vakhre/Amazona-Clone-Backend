const XMLHttpRequest = require("xhr2");

const getHTMLFromUrl = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "html";
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      if (xhr.response === "") {
        callback(null, "empty response");
      } else {
        callback(null, xhr.response);
      }
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

module.exports = {
  getHTMLFromUrl,
};
