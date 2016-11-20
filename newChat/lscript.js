var notify=document.getElementById('notification');

function login(){
    var username=document.getElementById('');
    var password=document.getElementById('');
    
    var request=new XMLHttpRequest();
    
    request.open('POST','http://srimadhan11.imad.hasura-app.io/new/login',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username, passwword:password}));
}
function signup(){
    var username=document.getElementById('');
    var password=document.getElementById('');
    
    var request=new XMLHttpRequest();
    
    request.open('POST','http://srimadhan11.imad.hasura-app.io/new/create',true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username:username, passwword:password}));
}