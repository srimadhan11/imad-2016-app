var friendd;
var url='http://srimadhan11.imad.hasura-app.io';

function logout() {
  window.location.href=url+'/new/logout';
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
    request.open('POST', url+'/new/send', true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({msg:mes, friend:friendd}));
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
    request.open('POST', url+'/new/search', true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({friend:friend}));
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
    request.open('POST', url+'/new/chatlist', true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({friend:fname}));
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
    request.open('GET', url+'/new/friends', true);
    request.send(null);
}

setInterval(function () {
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
    request.open('GET', url+'/new/newf', true);
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
        request.open('POST', url+'/new/newmsg', true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({friend:friendd}));
    }
},5000);

function fri(fname){
    console.log(fname);
    friendd=fname;
    chatlist(fname);
}
