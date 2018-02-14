var token;
var userEmail;
var

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
    //window.alert("Hello TDDD97!");
};

/*xhttp.onreadystatechange = function() {

  // Check if fetch request is done
  if (xhttp.readyState == 4 && xhttp.status == 200) {
    alert("hejhej");
    //var jsonData = JSON.parse(xhr.responseText);
  }
};
*/
/*
var getJSON = function(url, method) {
    var xhhtp = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.responseType = 'json';

}
*/
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
}

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
    var object = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        firstname: document.getElementById('firstname').value,
        familyname: document.getElementById('familyname').value,
        gender: list[index].text,
        city: document.getElementById('city').value,
        country: document.getElementById('country').value
    };

    if (name.length > 0 && fname.length > 0 && city.length > 0 && country.length > 0 && email.length > 0) {
        if (pass == rep) {
            if(email.match(re)){
                if (pass.length > 2) {

                    var xhttp = new XMLHttpRequest();
                    alert("hej");
                    xhttp.onreadystatechange = function() {
                        alert("func");
                        if (this.readyState == 4 && this.status == 200) {
                            var result = JSON.parse(xhttp.responseText);
                            if(result.success) {
                                alert("result");
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
                                alert("funkar ej");
                                document.getElementById("response").innerHTML = result.message;
                            }
                        }
                    };
                    xhttp.open("POST","/adduser", true);
                    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xhttp.send(formadata);

                    /*result = serverstub.signUp(object);
                    if (result.success) {
                        document.getElementById("firstname").value= '';
                        document.getElementById("familyname").value= '';
                        document.getElementById("w3-select").value= '"" disabled selected';
                        document.getElementById("city").value= '';
                        document.getElementById("country").value= '';
                        document.getElementById("email").value= '';
                        document.getElementById("password").value= '';
                        document.getElementById("repeat").value= '';
                    }
                    document.getElementById("response").innerHTML = result.message;*/
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
    result = serverstub.signIn(user, pass);
    document.getElementById("responselog").innerHTML = result.message;
    if (result.success) {
        token = result.data;
        userEmail = user;
        var view2 = document.getElementById("profileview").innerHTML;
        displayView(view2);
        userInfo(token, user, "home");
        updateWall("home");
    }
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
    if(newPassword === repeatNewPassword) {
        if (oldPassword !== newPassword) {
            if (newPassword.length > 2){
                var result = serverstub.changePassword(token, oldPassword, newPassword);
                if(result) {
                    document.getElementById("oldpassword").value= '';
                    document.getElementById("newpassword").value= '';
                    document.getElementById("repeatnewpassword").value= '';
                }
                document.getElementById("response1").innerHTML = result.message;
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
  var returnCode = serverstub.getUserDataByEmail(token,email);
  var userData = returnCode.data;

  document.getElementById(view + "-info-firstname").innerHTML = userData.firstname;
  document.getElementById(view + "-info-familyname").innerHTML = userData.familyname;
  document.getElementById(view + "-info-gender").innerHTML = userData.gender;
  document.getElementById(view + "-info-city").innerHTML = userData.city;
  document.getElementById(view + "-info-country").innerHTML = userData.country;
  document.getElementById(view + "-info-email").innerHTML = userData.email;
}

function postmessage(view) {
    email = document.getElementById(view + '-info-email').innerText;
    var message = document.getElementById(view + "-inputpost").value;
    serverstub.postMessage(token, message, email);
    document.getElementById(view + '-inputpost').value= '';
    updateWall(view);
}

function updateWall(view) {
    email = document.getElementById(view + '-info-email').innerText;
    var response = serverstub.getUserMessagesByEmail(token, email).data;
        document.getElementById(view + "-apost").innerHTML = "<br>" + response[0].writer + " - " + response[0].content + "</br>";
        for (var i = 1; i < response.length; ++i) {
            document.getElementById(view + "-apost").innerHTML += "<br>" + response[i].writer + " - " + response[i].content + "</br>";
        }
}

function searchforuser() {
    document.getElementById("browse-user-message").innerHTML = '';
    var email = document.getElementById("search").value;
    var response = serverstub.getUserMessagesByEmail(token, email);
    document.getElementById('search').value= '';
    if(response.data) {
        userInfo(token, email, "browse");
        document.getElementById("browse-reload").style.display = "block";
        var PIdiv = document.getElementById("browse-personalinformation");
        PIdiv.style.display = "block";
        var PAdiv = document.getElementById("browse-postarea");
        PAdiv.style.display = "block";
        var PWdiv = document.getElementById("browse-postwall");
        PWdiv.style.display = "block";
        updateWall("browse");
    }
    else{
        document.getElementById("browse-user-message").innerHTML = response.message;
    }
}

function signOut(event){
     result = serverstub.signOut(token);
     if (result.success) {
         var view = document.getElementById("welcomeview").innerHTML;
         displayView(view);
        }
}
