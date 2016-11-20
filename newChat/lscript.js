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
                    notify.innerHTML="sucess";
                }else{
                    notify.innerHTML="failed"
                }
            }
        }
    }
    
    request.open('POST','http://srimadhan11.imad.hasura-app.io/new/login',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username, password:password}));
}
function signup(){
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
                }else{
                    notify.innerHTML="nonvalid";
                }
            }
        }
    }
    
    request.open('POST','http://srimadhan11.imad.hasura-app.io/new/create',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username, password:password}));
}
