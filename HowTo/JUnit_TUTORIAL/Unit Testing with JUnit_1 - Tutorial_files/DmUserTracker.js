//var DmGlobalUserIdUrl = window.location.protocol + "//localhost:28557/Ads/GlobalUserIdentification/GetDmGlobalUserId"; //DEBUG
//var DmGlobalUserIdUrl = window.location.protocol +   "//cp-dev-sql2/Ads/GlobalUserIdentification/GetDmGlobalUserId"; //DEBUG

//var SetSegmentsUrl = window.location.protocol + "//localhost:28557/Ads/GlobalUserIdentification/SetDmGlobalUserTags"; //DEBUG
//var SetSegmentsUrl = window.location.protocol +   "//cp-dev-sql2/Ads/GlobalUserIdentification/SetDmGlobalUserTags"; //DEBUG

var DmGlobalUserIdUrl = window.location.protocol + "//apps.developermedia.com/Ads/GlobalUserIdentification/GetDmGlobalUserId"; //LIVE
//var SetSegmentsUrl = window.location.protocol +   "//apps.developermedia.com/Ads/GlobalUserIdentification/SetDmGlobalUserTags"; //LIVE

//When ready to go live just load a.js to avoid maintaining 2 versions of same functions
//but smaller script could be loaded faster... which is better?

var DmGlobalUserIdKey = "DmGlobalUserId";

var Cookies =
{
    //Cookies
    //-----------------------------------------------------------------------------------------

    GetDomain: function () {
        var hostname = document.location.hostname;
        var domain = /([^.]+\.[^.]{3,})$/i.exec(hostname);
        return domain != null ? domain[1] : (domain = /([^.]+\.[^.]+\.[^.]{2})$/i.exec(hostname), domain != null ? domain[1] : hostname);
    },

    SetValue: function (name, value, days, path, domain, secure) {
        var cookie = "", expiryDate;

        cookie = name + "=" + value;
        if (days > 0 && (expiryDate = new Date(), expiryDate.setTime(expiryDate.getTime() + days * 864E5)))
            cookie += "; expires=" + expiryDate.toGMTString();

        path && (cookie += "; path=" + path);
        domain && domain.indexOf(".") != -1 && (cookie += "; domain=" + domain);
        secure && (cookie += "; secure");
        document.cookie = cookie;
    },

    GetValue: function (name) {
        var cookieString = document.cookie;
        var value = null;

        if (cookieString != "") {
            var cookies = cookieString.split(";");

            for (index = 0; index < cookies.length; index++) {
                var cookie = cookies[index].replace(/^\s+/, "");
                if (cookie.substring(0, name.length + 1) == name + "=") {
                    value = cookie.substring(name.length + 1);
                    break;
                }
            }
        }

        return value;
    },

    IsEnabled: function () {
        //this test could return a false positive when cookies are enabled 
        //but the browser rejects third party cookies
        /*if (navigator.cookieEnabled != void 0) {
            return navigator.cookieEnabled;
        }*/
        document.cookie = "testcookie=test; max-age=10000";
        return document.cookie.indexOf("testcookie=test") >= 0;
    }

    //End of cookies
    //-----------------------------------------------------------------------------------------
};

var LocalStorage =
{
    //Local Storage
    //-----------------------------------------------------------------------------------------

    //returns true is local storage is enabled
    IsEnabled: function () {
        return typeof (Storage) !== "undefined" ? true : false;
    },

    //retrives value from local storage for the specified keu
    GetValue: function (key) {
        localStorage.getItem(key);
    },

    //sets the value for the specified key
    SetValue: function (key, value) {
        localStorage.setItem(key, value);
    }

    //End of Local Storage
    //-----------------------------------------------------------------------------------------
}

if (window.addEventListener) {
    window.addEventListener("message", receiveMessage, false);
}
else {
    try { window.attachEvent("message", receiveMessage); } catch (e) { }
}

function receiveMessage(event) {
    //we dont send a message unless we know the browser has JSON parser
    var receivedMessage = JSON.parse(event.data);    

    var sentMessage = new Object();
    sentMessage.Id = receivedMessage.Id;
    sentMessage.DmGlobalUserId = GetDMGlobalUserID();
    
    //no local user id present
    if (!sentMessage.DmGlobalUserId) {
        var sendDmGlobalUserId = function (response) {
            if (response) {                
                sentMessage.DmGlobalUserId = JSON.parse(response).DmGlobalUserId;
                //response headers should set the cookie, this call also tries to set it in LocalStorage
                SetDMGlobalUserID(sentMessage.DmGlobalUserId);

                if (!GetDMGlobalUserID())
                    sentMessage.DmGlobalUserConfirmResponse = "TP_ACCESS_DENIED";
                else
                    sentMessage.DmGlobalUserConfirmResponse = "OK";
            } 

            event.source.postMessage(JSON.stringify(sentMessage), receivedMessage.sender); //arg 2 is requesting domain name
            //SetUserTags(DmGlobalUserId, receivedMessage.segments, SetSegmentsUrl);
        };

        CreateDMGlobalUserId(DmGlobalUserIdUrl, sendDmGlobalUserId);
    }
    //local user id present and the received message contains a return address
    else if (receivedMessage && receivedMessage.sender) {        
        sentMessage.DmGlobalUserConfirmResponse = "OK";
        event.source.postMessage(JSON.stringify(sentMessage), receivedMessage.sender); //arg 2 is requesting domain name
        //SetUserTags(DmGlobalUserId, receivedMessage.segments, SetSegmentsUrl);
    }
}

function CreateDMGlobalUserId(endPointURL, responseCallbackFunction) {
    var http = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");

    //****** HOW TO TEST HTTP response statuses ***************************************
    //to trigger timeout set breakpoint in the .cs code file
    //to trigger request failed set target_url to an invalid URL
    server_write_timeout = setTimeout(function () {
        http.abort(); //calling abort will trigger http.status != 200                
    }, 1000);

    http.onreadystatechange = function () {
        try {
            if (http.readyState == 4) {
                clearTimeout(server_write_timeout);
                if (http.status == 200) {
                    responseCallbackFunction(http.responseText);
                }
                else {
                    responseCallbackFunction(null);
                }
            }
        }
        catch (e) {
            clearTimeout(server_write_timeout);
            responseCallbackFunction(null);
        }
    }

    http.open("POST", endPointURL, true); //async send
    http.setRequestHeader("Content-Type", "application/json");
    http.send(null);
}

//optimistically send tags to the server
function SetUserTags(DmGlobalUserId, segments, endPointURL) {
    /*var http = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");

    var data = new Object();
    data.DmGlobalUserId = DmGlobalUserId;
    data.segments = JSON.stringify(segments);

    http.open("POST", endPointURL, true); //async send
    http.setRequestHeader("Content-Type", "application/json");
    http.send(JSON.stringify(data));*/
}

//reads a user ID from either local store or cookie
function GetDMGlobalUserID() {
    var DmGlobalUserId = Cookies.GetValue(DmGlobalUserIdKey);
    //if cant read cookie check local storage
    if (!DmGlobalUserId && LocalStorage.IsEnabled()) 
        DmGlobalUserId = LocalStorage.GetValue(DmGlobalUserIdKey);
    
    return DmGlobalUserId;
}

function SetDMGlobalUserID(UserId) {
    
    if (LocalStorage.IsEnabled())
        LocalStorage.SetValue(DmGlobalUserIdKey, UserId);

    if (Cookies.IsEnabled())
        Cookies.SetValue(DmGlobalUserIdKey, UserId, 365 * 50, "/", Cookies.GetDomain(), true);
}

//debug
//GetDmGlobalUserId(window.location.protocol + "//localhost:28557/Ads/GlobalUserIdentification/GetDmGlobalUserId", function (response) { alert(response); });
//var event = new Object();
//var data = new Object();
//data.sender = "dsfdsf";
//event.data = JSON.stringify(data);

//receiveMessage(event);