var notify=document.getElementById('notification');

function login(){
    var username=document.getElementById('');
    var password=document.getElementById('');
    
    var request=new XMLHttpRequest();
    
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=request.responseText;
                if(result.trim()==="sucess"){
                    //redirect
                }else{
                    //notify
                }
            }
        }
    }
    
    request.open('POST','http://srimadhan11.imad.hasura-app.io/new/login',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username, passwword:password}));
}
function signup(){
    var username=document.getElementById('');
    var password=document.getElementById('');
    
    var request=new XMLHttpRequest();
    
    request.onreadystatechange=function(){
        if(request.readyState===XMLHttpRequest.DONE){
            if(request.status===200){
                var result=request.responseText;
                if(result.trim()==="valid"){
                    //notify
                }else{
                    //notify
                }
            }
        }
    }
    
    request.open('POST','http://srimadhan11.imad.hasura-app.io/new/create',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username, passwword:password}));
}