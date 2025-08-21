var baseURL = document.location.origin || "https://"+document.domain+":443"

function getNewXHRObject(){
  var xhr
  if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest()// code for IE7+, Firefox, Chrome, Opera, Safari
  } else {
      xhr = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
    }
  return xhr;
}





























var socket = io();



/** GET: SESSION **/

/** Document.onLoad(callback) (First function executed when app runs) Document.onLoad()**/
document.addEventListener("DOMContentLoaded",function(){
  //no cookie? Why??? :(
  var url= baseURL+"/session?id="+document.cookie
  console.log(url)
  var xhr = getNewXHRObject();
  xhr.open("GET", url, true)
  xhr.send(null)
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE ) {
       if(xhr.status == 200){
          var user = JSON.parse(xhr.responseText)
          console.log("FBchat.js!" + user.nickname)
          if(user._id != undefined){
            document.getElementById("profile").style.display = true;
            document.getElementById("profile").firstElementChild.firstElementChild.append(user.nickname)
            document.getElementById("signIn").style.display = "none";
          
          }else{
            document.getElementById("profile").style.display = "none";
            document.getElementById("signIn").style.display = true;
          }
       }
       else if(xhr.status == 400) {
          alert('There was an error 400')
       }
       else {
           alert('something else other than 200 was returned')
       }
    }
  }

})















/** 
POST : LOGIN function():
  Si el status = 200 inicia 
  El Content-type Negociation: 
        Si es "application/json" -->login con error (se setea la clase .error de CSS)
        Si es cualquier otro  -->> se hace un render al xhr.responseText (debería ser un HTML)
**/
function login(){
  var url = baseURL+"/login"
  var user = document.getElementById("loginForm").elements["user"]
  var pass = document.getElementById("loginForm").elements["pass"]
  var params = "user="+user.value+"&password="+pass.value
  var xhr = getNewXHRObject()
  xhr.open("POST", url, true)
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(params)
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE ) {
       if(xhr.status == 200){
          var content = xhr.getResponseHeader("Content-Type")
          if(content == "application/json; charset=utf-8"){
            var json = JSON.parse(xhr.responseText)
            if(json.isERROR){
              user.addClass("error")
              pass.classList.add("error")
            }
          }else{
            document.open()
            document.write(xhr.responseText)
            document.close()
          }  
        }else if(xhr.status == 400) {
          alert('There was an error 400')
        }else {
          alert('something else other than 200 was returned')
      }
    }
  }
}

//POST : User
function user(){
  var url = baseURL+"/user"
  console.log(url)
  var name = document.getElementById("signUpForm").elements["name"]
  var lastName= document.getElementById("signUpForm").elements["lastName"]
  var nickname = document.getElementById("signUpForm").elements["nickname"]
  var email= document.getElementById("signUpForm").elements["email"]
  var pass = document.getElementById("signUpForm").elements["pass"]
  var gender = document.getElementById("signUpForm").elements["gender"]
  var params = "name="+name.value+"&lastName="+lastName.value+"&nickname="+nickname.value+"&email="+email.value+"&password="+pass.value+"&gender="+gender.value
  var xhr = getNewXHRObject()
  console.log(params)
  xhr.open("POST", url, true)
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(params)
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE ) {
       if(xhr.status == 200){
          var content = xhr.getResponseHeader("Content-Type")
          if(content == "application/json; charset=utf-8"){
            var json = JSON.parse(xhr.responseText)
            if(json.isERROR){
              userName.addClass("error")
              pass.addClass("error")
            }
          }else{
            document.open()
            document.write(xhr.responseText)
            document.close()
          }  
        }else if(xhr.status == 400) {
          alert('There was an error 400')
        }else {
          alert('something else other than 200 was returned')
      }
    }
  }
}

 /* AJAX Request Template2: "HTTP POST verb - Chat AJAX implementation."
function ajaxReq(){
  var text = document.getElementById("chatForm").elements["text"]
  var chat = document.getElementById("chatContent")
  var url = baseURL+"/text"
  var params = "text="+text.value
  var xhr = getNewXHRObject()
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(params);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE ) {
     if(xhr.status == 200){
     		var json = JSON.parse(xhr.responseText)        
        var finalMsg = getEmojis(json.text)
        chat.innerHTML = chat.innerHTML+'<br>'+'<span>'+finalMsg+'</span>';
        updateScroll()
        text.value = ""
      }
      else if(xhr.status == 400) {
        alert('There was an error 400')
      }
      else {
         alert('something else other than 200 was returned')
      }
    }
  }
}
*/