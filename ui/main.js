var time;
var article_id;
var url='http://srimadhan11.imad.hasura-app.io/';
function timer(){
    document.getElementById('notification').innerHTML='';
    clearTimeout(time);
}
function start(){
    document.body.innerHTML=`
        <div class="container">
            <div class="center">
                <img src="/ui/madi.png" class="img-medium">
            </div>
             <div>
                <p>My name is Sri Madhan</p>
                <p>I am studying II Year in B.E Computer Science Engineering</p>
            </div>
            <hr>
            <div style="width: 100%;margin: auto 30%;">
                <input class="inp" id="username" placeholder="Username" type="text">
                <input class="inp" id="password" placeholder="Password" type="password">
                <button class="btn-ptr" onclick="login()">Log In</button>
                <button class="btn-sec" onclick="create()">Create</button>
            </div>
            <div id='notification'>
                <br/>
            </div>
            <hr>
            <div id="article">
            </div>
        </div>
    `;
    var article=document.getElementById('article');
    
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=request.responseText.trim();
                result=JSON.parse(result);
                var temp='';
                for (var i = 0; i < result.length; i++) {
                        temp+=`<button onclick="article(`+result[i].id+`)" class="btn-list">`+result[i].name+`</button>`;
                    }
                article.innerHTML=temp;
            }
        }
    }
    
    request.open('GET',url+'articles',true);
    request.send(null);
}

function login(){
    var username=document.getElementById('username').value;
    var password=document.getElementById('password').value;
    var notify=document.getElementById('notification');
    
    var request=new XMLHttpRequest();
    
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=request.responseText;
                if(result.trim()==="credentials are correct"){
                    notify.innerHTML='sucess';
                    document.getElementById('username').value='';
                    document.getElementById('password').value='';
                }else{
                    notify.innerHTML="failed";
                }
                time=setTimeout(timer,3000);
            }
        }
    }
    
    request.open('POST',url+'new/login',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username, password:password}));
}
function create(){
    var username=document.getElementById('username').value;
    var password=document.getElementById('password').value;
    var notify=document.getElementById('notification');
    
    var request=new XMLHttpRequest();
    
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=request.responseText;
                if(result.trim()==="valid"){
                    notify.innerHTML="valid";
                    document.getElementById('username').value='';
                    document.getElementById('password').value='';
                }else{
                    notify.innerHTML="nonvalid";
                }
                time=setTimeout(timer,3000);
            }
        }
    }
    
    request.open('POST',url+'new/create',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username, password:password}));
}
function article(articleid){
    article_id=articleid;
    document.body.innerHTML=`
        <div class='container'>
            <button class="btn-ptr" onclick="start()">Home</button>
            <button class="btn-sec" id="logoutbtn" onclick="logout()" style="float:right;display:block;">Logout</button>
            <br/>
            <div id='articlename'></div>
            <br/>
            <div id='articlebody'></div>
            <hr/>
            <h3>User Comments</h3>
            <div id='commentbox'>
                
            </div>
            <br/>
            <div id='comment'></div>
        </div>
    `;
    
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=JSON.parse(request.responseText);
                document.getElementById('articlename').innerHTML=result.name;
                document.getElementById('articlebody').innerHTML=result.content;
            }
        }
    }
    
    request.open('POST',url+'article',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({articleid:articleid}));
    
    var request1=new XMLHttpRequest();
    request1.onreadystatechange=function(){
        if(request1.readyState===XMLHttpRequest.DONE){
            if(request1.status===200){
                var result=request1.responseText;
                if(result.trim()==='loggedin'){
                    document.getElementById('commentbox').innerHTML=`
                        <textarea id="commenttext" style='display:block;' rows="5" cols="80" placeholder="Enter your comment"></textarea>
                        <button class="btn-sec" onclick="submit()">Submit</button>
                    `;
                    document.getElementById('logoutbtn').style.visibility='visible';
                }else{
                    document.getElementById('commentbox').innerHTML='';
                    document.getElementById('logoutbtn').style.visibility='hidden';
                }
            }
        }
    }
    
    request1.open('GET',url+'check',true);
    request1.send(null);
    comment();
    
}
function submit(){
    var com=document.getElementById('commenttext').value;
    var request=new XMLHttpRequest();
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                if(request.responseText.trim()==='sucess'){
                    document.getElementById('commenttext').value='';
                    comment();
                }
            }
        }
    }
    
    request.open('POST',url+'submit',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({comment:com,articleid:article_id}));
}
function comment(){
    var request2=new XMLHttpRequest();
    request2.onreadystatechange=function(){
        if(request2.readyState===XMLHttpRequest.DONE){
            if(request2.status===200){
                var result=JSON.parse(request2.responseText.trim());
                var temp='';
                for (var i = 0; i < result.length; i++) {
                        var time = new Date(result[i].time);
                        temp+= `
                            <p>${result[i].comments}</p>
                            <div class="comments">
                                ${result[i].user_name} - ${time.toLocaleTimeString()} on ${time.toLocaleDateString()} 
                            </div>
                        `;
                    }
                document.getElementById('comment').innerHTML=temp;
            }
        }
    }
    
    request2.open('POST',url+'comments',true);
    request2.setRequestHeader('Content-Type','application/json');
    request2.send(JSON.stringify({articleid:article_id}));
}
function logout(){
    var request1=new XMLHttpRequest();
    request1.onreadystatechange=function(){
        if(request1.readyState===XMLHttpRequest.DONE){
            if(request1.status===200){
                var result=request1.responseText;
                if(result.trim()==='sucess'){
                    start();
                }
            }
        }
    }
    
    request1.open('GET',url+'logout',true);
    request1.send(null);
    
}