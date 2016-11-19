var user;
var password;
var friendd;
var flag=false;
var url='http://srimadhan11.imad.hasura-app.io';

function welcome() {
    document.body.innerHTML=`
    <div class="container">
        <div align="center" font-family="san-serif" class="text">Welcome</div>
        <input class="inp" id="email" type="email" placeholder="Username">
        <input class="inp" id="pass" type="password" placeholder="Password">
        <button id="login" onclick="log()" class="btn-pr">Log In</button>
        <button id="signup" onclick="newac()" class="btn-sec">Sign In</button>
    </div>`;
    document.title='Welcome';
}
function newac() {
    document.body.innerHTML=`
    <div class="container">
        <div align="center" font-family="san-serif" class="text">Welcome</div>
        <input class="inp" id="newemail" type="email" placeholder="Username">
        <input class="inp" id="newpass" type="password" placeholder="Password">
        <button onclick="create()" class="btn-pr">Create & Log In</button>
        <button class="btn-sec" onclick="welcome()">Back</button>
    </div>`;
    document.title='Sign Up';
}
function prof() {
    flag=true;
    document.body.innerHTML=`
    <div align="center" font-family="san-serif" class="text">Chat</div>
    <button class="btn-pr" style="float: right;" onclick="logout()">Logout</button>
      <div class="container3">
          <div id="friend1" style="
      margin-top: 10px;
      margin-bottom: 10px;
      margin-left: 5px;
      margin-right: 30px;
  ">
              <div>
                  <input class="inp" id="friend" type="text" placeholder="Search Friends">
                  <button class="btn-pr" id="search" onclick="search()">Search</button>
              </div>
  <br>
              <div id="fr">

              </div>
          </div>
          <div style="border-left:solid grey;"></div>
          <div id="chat" class="container2">
              <div class="text" id="frienname"></div>
              <div style="height: 225px;overflow: auto;" id="ch">
                Find and select your friends in leftside panel to view the conversation
              </div>
              <div class="container1">
                  <input class="inp1" id="msg" type="text" placeholder="Write a message">
                  <button class="btn-sec" id="send" onclick="send()">Send</button>
              </div>
          </div>
      </div>
    `;
    document.title='Chat';
    friendlist();
}
function wrguser() {
    document.body.innerHTML=`
    <div class="container">
        <h1>Invalid user id or password</h1>
        <button class="btn-sec" onclick="welcome()">Back</button>
    </div>
    `;
    document.title='Invalid user id or password';
}
function userexist() {
    document.body.innerHTML=`
    <div class="container">
        <h1>User already exist</h1>
        <button class="btn-sec" onclick="welcome()">Back</button>
    </div>
    `;
    document.title='User already exist';
}

function logout() {
  window.location.href=url+`/chat/main.html`;
}

function log(){
    var name=document.getElementById('email').value;
    var pass=document.getElementById('pass').value;
    valid(name,pass);
}
function create(){
    var name=document.getElementById('newemail').value;
    var pass=document.getElementById('newpass').value;
    creationsuccess(name,pass);
}

function send(){
    var mes=document.getElementById('msg').value;
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                createchatlist(request.responseText.trim(),friendd);
            }
        }
    }
    request.open('GET', url+'/chat/send?n='+user+'&p='+password+'&c='+mes+'&to='+friendd+'&', true);
    request.send(null);
}
function search(){
    var friend=document.getElementById('friend').value;
    console.log(friend);
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                createfriendlist(request.responseText.trim());
            }
        }
    }
    request.open('GET', url+'/chat/search?n='+user+'&p='+password+'&f='+friend+'&', true);
    request.send(null);
}

function valid(name,pass){
    //on valid id and pass return true
    //else return false
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=request.responseText;
                if(result.trim()==="valid"){
                    user=name;
                    password=pass;
                    prof();
                    console.log("returned");
                }else{
                    wrguser();
                }
            }
        }
    }
    request.open('GET', url+'/chat/validate?n='+name+'&p='+pass+'&', true);
    request.send(null);
}
function creationsuccess(name,pass){
    //on sucessfull creation return true;
    //else return false
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=request.responseText;
                if(result.trim()==="sucess"){
                    welcome();
                }else{
                    userexist();
                }
            }
        }
    }
    request.open('GET', url+'/chat/create?n='+name+'&p='+pass+'&', true);
    request.send(null);
}

function createchatlist(resp,fname){
    if(resp==="sucess"){
        chatlist(fname);
    }else{
        //notify failure
        alert("failed");
    }
}
function createfriendlist(resp){
    if(resp==="added"){
        friendlist();
    }else{
        //notify failure
        alert("not added");
    }
}

function chatlist(fname){
    document.getElementById('frienname').innerHTML=fname;
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=JSON.parse(request.responseText.trim());
                var temp=`
                    <table style="width: 100%;">
                    `;
                //generate chat list and return
                for (var i = 0; i < result.rows.length; i++) {
                    temp1=result.rows[i]
                    if (temp1.flag===0) {//reciev
                        temp+=`
                            <tr>
                            <td span class="green">`+temp1.msg+`</td>
                            <td></td>
                            </tr>
                            `;
                    }else {//send
                        temp+=`
                            <tr>
                            <td></td>
                            <td span class="yellow">`+temp1.msg+`</td>
                            </tr>
                            `;
                    }
                }
                temp+=`</table>`;
                if(result.rows.length===0)
                temp=`No history of conversation`;
                document.getElementById('ch').innerHTML=temp;
            }
        }
    }
    request.open('GET', url+'/chat/chatlist?n='+user+'&p='+password+'&f='+fname+'&', true);
    request.send(null);
}
function friendlist() {
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=request.responseText.trim();
                console.log(result);
                console.log(result.length);
                if (result==='nonvalid') {
                    console.log("nonvalid");
                    document.getElementById('fr').innerHTML="Find your friends using their username";
                }else {
                    result=JSON.parse(result);
                    var temp='';
                    //generate friends list and return
                    for (var i = 0; i < result.length; i++) {
                        var temp1=result[i].fr_name;
                        console.log(temp1);
                        temp+=`<button onclick="fri('`+temp1+`')" class="btn-list">`+temp1+`</button>`;
                    }
                    document.getElementById('fr').innerHTML=temp;
                }
            }
        }
    }
    request.open('GET', url+'/chat/friends?n='+user+'&p='+password+'&', true);
    request.send(null);
}

setInterval(function () {
    if (flag) {
        var request=new XMLHttpRequest();
        request.onreadystatechange=function(){
            if(request.readyState===XMLHttpRequest.DONE){
                if(request.status===200){
                    if (request.responseText.trim()==='new') {
                        friendlist();
                    }
                }
            }
        }
        request.open('GET', url+'/chat/newf?n='+user+'&p='+password+'&', true);
        request.send(null);
        if (friendd!=null) {
            var request1=new XMLHttpRequest();
            request1.onreadystatechange=function(){
                if(request1.readyState===XMLHttpRequest.DONE){
                    if(request1.status===200){
                        if (request1.responseText.trim()==='new') {
                            chatlist(friendd);
                        }
                    }
                }
            }
            request1.open('GET', url+'/chat/newmsg?n='+user+'&p='+password+'&f='+friendd+'&', true);
            request1.send(null);
        }
    }
},5000);

function fri(fname){
    console.log(fname);
    friendd=fname;
    chatlist(fname);
}
