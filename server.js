var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

var Pool=require('pg').Pool;

var config={
    user:'srimadhan11',
    database:'srimadhan11',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password:process.env.DB_PASSWORD
};

var pool=new Pool(config);

//chat

app.get('/chat',function(req,res){
    res.sendFile(path.join(__dirname,'chat','welcome.html'));
});

app.get('/chat/prof',function(req,res){
    pool.query("SELECT * FROM usert where name=$1", [req.query.n],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            var responce=JSON.parse(result.row[0]);
            if(result.rows.length===0){
                res.send("User does not exist");
            }else if(responce.pass==req.query.a){
                res.send(responce.pass);
            }else{
                var re="FAILED";
                pool.query("SELECT * FROM $1" ,[req.query.n],function(err,result){
                    re+="i";
                    if(err){
                        res.status(500).send(err.toString());
                    }else if(result.rows.length===0){
                        re="SUCCESS";
                    }
                });
                res.send(re);
            }
        }
    });
});

app.get('/prof',function(req,res){
    var t=req.query.t;
    var re="FAILED";
    pool.query("SELECT * FROM $1" ,[t],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            re="SUCCESS";
        }
    });
    res.send(re);
});

app.get('/chat/new',function(req,res){
    res.sendFile(path.join(__dirname,'chat','new.html'));
});

app.get('/chating',function(req,res){
    var str = req.query.i;
    str+=req.query.j;
    res.send(str.toString());
});

//chat
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});
app.get('/repeat/:hello',function(req,res){
    var hello=req.params.hello;
    res.send(hello.toString());
});
app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});
app.get('/ui/main.js',function(req,res){
    res.sendFile(path.join(__dirname,'ui','main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'new.html'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});