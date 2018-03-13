var token;
var userEmail;
var webSocket

displayView = function(page){
    document.body.innerHTML = page;
// the code required to display a view
};

window.onload = function() {
    var view = document.getElementById("welcomeview").innerHTML;
    displayView(view);
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
};

/*
function requestFunction(method, url, params) {
    alert("den gar in i requestfunc");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("Godkand");
            result = JSON.parse(this.responseText);
            alert("Det funkar");
        }
    };
    if (method == "GET") {
        xhttp.open(method, url + '?' + params, true);
        xhttp.send();
    } else if (method == "POST") {
        alert("Post funkar");
        xhttp.open(method, url, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.setRequestHeader("token", params);
        xhttp.send(params);
         alert("POST funkar efter också");
    }
}*/

function checknewuser(event) {
    event.preventDefault();

    var index = document.getElementById('w3-select').selectedIndex;
    var list = document.getElementById('w3-select').options;

    var pass = document.getElementById('password').value;
    var rep = document.getElementById('repeat').value;
    var name = document.getElementById('firstname').value;
    var fname = document.getElementById('familyname').value;
    var country = document.getElementById('country').value;
    var city = document.getElementById('city').value;
    var email = document.getElementById('email').value;

    var formdata = "email=" + email + "&";
    formdata += "password=" + pass + "&";
    formdata += "firstname=" + name + "&";
    formdata += "familyname=" + fname + "&";
    formdata += "gender=" + list[index].text + "&";
    formdata += "city=" + city + "&";
    formdata += "country=" + country;
	
	

    var re = /\w+\@\w+\.\w+/;

    if (name.length > 0 && fname.length > 0 && city.length > 0 && country.length > 0 && email.length > 0) {
        if (pass == rep) {
            if(email.match(re)){
                if (pass.length > 2) {

                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (xhttp.readyState == 4 && xhttp.status == 200) {
                            var result = JSON.parse(xhttp.responseText);
                            if(result.success) {
                                document.getElementById("firstname").value= '';
                                document.getElementById("familyname").value= '';
                                document.getElementById("w3-select").value= '"" disabled selected';
                                document.getElementById("city").value= '';
                                document.getElementById("country").value= '';
                                document.getElementById("email").value= '';
                                document.getElementById("password").value= '';
                                document.getElementById("repeat").value= '';
                                document.getElementById("response").innerHTML = result.message;
                            }
                            else {
                                document.getElementById("response").innerHTML = result.message;
                            }
                        }
                    };
                    xhttp.open("POST","/adduser", true);
                    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xhttp.send(formdata);

                }
                else {
                    document.getElementById("response").innerHTML = "The password is to short.";
                }
            } else {
                document.getElementById("response").innerHTML = "Wrong email format";
            }
        }
        else {
            document.getElementById("response").innerHTML = "The passwords do not match";
        }
    }
    else {
        document.getElementById("response").innerHTML = "All inputs must be filled.";
    }
}

function loggingin(event) {
    event.preventDefault();
    var user = document.getElementById('email1').value;
    var pass = document.getElementById('password1').value;
    var formdata = "email=" + user + "&";
    formdata += "password=" + pass + "&";

    userEmail = user;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var result = JSON.parse(xhttp.responseText);
            if(result.success) {
                token = result.message;
				connect_websocket(user, token);
                var view2 = document.getElementById("profileview").innerHTML;
                displayView(view2);
                userInfo(token, user, "home");
                updateWall("home", user);

            } else {
                document.getElementById("responselog").innerHTML = result.message;
            }
        }
    }
    xhttp.open("POST", "/signin", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(formdata);
}



function tabulardata(tabdata) {
    var i;
    var x = document.getElementsByClassName("tab");
    var y = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        if(x[i].id != tabdata){
            x[i].style.display = "none";
            y[i].style.backgroundColor = '#9ce9ff'; //Non-pressed button
        } else{
            x[i].style.display = "block";
            y[i].style.backgroundColor = '#6f8cff'; //Pressed button
        }
    }
}

function changepassword(event) {
    event.preventDefault();
    var oldPassword = document.getElementById("oldpassword").value;
    var newPassword = document.getElementById("newpassword").value;
    var repeatNewPassword = document.getElementById("repeatnewpassword").value;
	var signature = hashParametersWithToken(token, userEmail, ["oldpass", oldPassword, "newpass", newPassword]);
    var formdata = 'oldpass=' + oldPassword + '&newpass=' + newPassword + "&"
	+ 'sign=' + signature;
    if(newPassword === repeatNewPassword) {
        if (oldPassword !== newPassword) {
            if (newPassword.length > 2){
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        var response = JSON.parse(xhttp.responseText);
                        if(response.success) {
                            document.getElementById("oldpassword").value= '';
                            document.getElementById("newpassword").value= '';
                            document.getElementById("repeatnewpassword").value= '';
                        }
                        document.getElementById("response1").innerHTML = response.message;
                    }
                }
                url = "/changepass/" + md5(token);
                xhttp.open("POST", url, true);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send(formdata);
            } else {
                document.getElementById("response1").innerHTML = "The password is to short.";
            }
        } else {
            document.getElementById("response1").innerHTML = "The new and old password can not match";
        }
    } else {
        document.getElementById("response1").innerHTML = "The new and repeated passwords do not match";
    }
}

function userInfo(token, email, view) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var userData = JSON.parse(xhttp.responseText);
            document.getElementById(view + "-info-firstname").innerHTML = userData.message[1];
            document.getElementById(view + "-info-familyname").innerHTML = userData.message[2];
            document.getElementById(view + "-info-gender").innerHTML = userData.message[3];
            document.getElementById(view + "-info-city").innerHTML = userData.message[4];
            document.getElementById(view + "-info-country").innerHTML = userData.message[5];
            document.getElementById(view + "-info-email").innerHTML = userData.message[0];
        }
    }
	var signature = hashParametersWithToken(token, email, []);
    var url = "/databyemail/" + md5(token) + "/" + signature;
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}

function postmessage(view) {
    var email = document.getElementById(view + '-info-email').innerText;
    var message = document.getElementById(view + "-inputpost").value;
    var xhttp1 = new XMLHttpRequest();
    xhttp1.onreadystatechange = function () {
        if (xhttp1.readyState == 4 && xhttp1.status == 200) {
            var response1 = JSON.parse(xhttp1.responseText);
            console.log(response1);
        }
    }
	var signature = hashParametersWithToken(token, email, ["message", message]);
    var getdata = 'message=' + message + "&" + signature;
	var url1 = "/postmessage/" + md5(token) + "/" + getdata; //email + "/" + message;
    xhttp1.open("GET", url1, true);
    xhttp1.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp1.send();
	
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function () {
        if (xhttp2.readyState == 4 && xhttp2.status == 200) {
            var response = JSON.parse(xhttp2.responseText);
            console.log(response);
            var arrlen = response.data.length;
            document.getElementById(view + "-apost").innerHTML = "<div class=wallmessage draggable=\"true\" ondragstart=\"drag(event)\">" + response.data[arrlen-1].from_user + " - " + response.data[arrlen-1].message + "</div>";
            for (var i = 1; i < arrlen; ++i) {
                document.getElementById(view + "-apost").innerHTML += "<div class=wallmessage draggable=\"true\" ondragstart=\"drag(event)\">" + response.data[arrlen-i-1].from_user + " - " + response.data[arrlen-i -1].message + "</div>";
            }
            updateWall(view, email);
        }
    }
	sign = hashParametersWithToken(token, email, []);
    var url2 = "/messagebyemail/" + md5(token) + "/" + sign;
    xhttp2.open("GET", url2, true);
    xhttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp2.send();

    document.getElementById(view + '-inputpost').value= '';
}

function updateWall(view, email) {
    if(!email) {
        var email = document.getElementById(view + '-info-email').innerText;
    }
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var response = JSON.parse(xhttp.responseText);
            console.log(response);
            var arrlen = response.data.length;
            document.getElementById(view + "-apost").innerHTML = "<div class=wallmessage draggable=\"true\" ondragstart=\"drag(event)\">" + response.data[arrlen-1].from_user + " - " + response.data[arrlen-1].message + "</div>";
            for (var i = 1; i < arrlen; ++i) {
                document.getElementById(view + "-apost").innerHTML += "<div class=wallmessage draggable=\"true\" ondragstart=\"drag(event)\">" + response.data[arrlen - i -1].from_user + " - " + response.data[arrlen - i - 1].message + "</div>";
            }
        }
    }
	var signature = hashParametersWithToken(token, email, []);
    var url = "/messagebyemail/" + md5(token) + "/" + signature;
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}

function searchforuser() {
    document.getElementById("browse-user-message").innerHTML = '';
    var email = document.getElementById("search").value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var response = JSON.parse(xhttp.responseText);
            userInfo(token, email, "browse");
            document.getElementById("browse-reload").style.display = "block";
            var PIdiv = document.getElementById("browse-personalinformation");
            PIdiv.style.display = "block";
            var PAdiv = document.getElementById("browse-postarea");
            PAdiv.style.display = "block";
            var PWdiv = document.getElementById("browse-postwall");
            PWdiv.style.display = "block";
            updateWall("browse", email);
        } else{
            console.log("error"); //document.getElementById("browse-user-message").innerHTML = response.message;
        }
    }
    var signature = hashParametersWithToken(token, email, []);
    var url = "/messagebyemail/" + md5(token) + "/" + signature;
	xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
    document.getElementById('search').value= '';
}

function signOut(event) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var response = JSON.parse(xhttp.responseText);
            if (response.success) {
                var view = document.getElementById("welcomeview").innerHTML;
                displayView(view);
            }
        }
    }
    var url = "/signout/" + md5(token);
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}

var webSocket

function connect_websocket(email, token) {
    webSocket = new WebSocket("ws://127.0.0.1:5000/api");
	
    webSocket.onopen = function(event){
		var message = JSON.stringify({"login":true, "message":"Logging in", "token":token, "user":email});
		webSocket.send(message);
    }
	
    webSocket.onmessage = function(event) {
		data = JSON.parse(event.data)
		console.log(data["message"]);
		if (data["logout"]) {
			console.log('signout, same user logged in twice');
			signOut();
		}
    }
    webSocket.onclose = function() {
        console.log("ws close");
    }
	
	webSocket.onerror = function(event) {
		console.log('error: ' + event.data);
	}
}

// Project, drag and drop

function allowDrop(ev){
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.innerHTML);
}


function drop(ev){
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var regex = /\w+\@\w+\.\w+ - (.+)/;
    var match = regex.exec(data);
    console.log(match[0]);
    console.log(match);
    ev.target.innerHTML = "asd";
    //var formData = new FormData();
    //formData.append('id', data);
    /*var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var response = JSON.parse(xhttp.responseText);
            if (response.success) {
                updateWall("home",);
            }
        }
    }
    var url = "/deletemessage/" + id;
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(formData);
*/
}

// Project, hashing parameters
function hashParametersWithToken(token, user, parameters){
	var data = ""
	for(var i = 0; i < parameters.length * 2; i++) {
		data += parameters[i*2] + "=" + parameters[i*2+1] + "&";
	}
	data += "user=" + user + "&";
	data += token;
	
	var hashedResponse = "sign=" + md5(data);
	hashedResponse += "&user=" + user;
	return hashedResponse;
}
