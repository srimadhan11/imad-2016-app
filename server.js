var express = require('express');
var morgan = require('morgan');
var path = require('path');

var crypto=require('crypto');
var bodyParser=require('body-parser');
var session=require('express-session');

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret:'noSecretValue',
    cookie:{maxAge:1000*60*60}
}));

var Pool=require('pg').Pool;

var config={
    user:'srimadhan11',
    database:'srimadhan11',
    host:'db.imad.hasura-app.io',
    port:'5432',
    password:process.env.DB_PASSWORD
};

var pool=new Pool(config);


//newChat
function hash(input,salt){
    var hashed=crypto.pbkdf2Sync(input,salt,1000,512,'sha512');
    return ["pbkdf2Sync","1000",salt,hashed.toString('hex')].join('$');
}
app.post('/new/create',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    var salt=crypto.randomBytes(128).toString('hex');
    var pString=hash(password,salt);
    
    
    pool.query("SELECT * FROM usert WHERE name = $1",[username],function(err,result){
        if(err){
            console.log(err.toString());
            res.send("failed");
        }else{
            if(result.rows.length===0){
                pool.query("insert into usert values($1,$2)",[username,pString],function(err1){
                    if(err1){
                        console.log(err1.toString());
                        res.send("failed");
                    }else{
                        pool.query("create table "+username+"_f(fr_name text not null primary key,fr_id serial not null unique,msg_flag smallint not null DEFAULT '0')",function(err2){
                            if(err2){
                                console.log(err2.toString());
                                res.send("failed");
                            }else{
                                pool.query("alter table "+username+"_f add foreign key (fr_name) references usert(name)",function(err3){
                                    if(err3){
                                        console.log(err3.toString());
                                        res.send("failed");
                                    }else{
                                        pool.query("create table "+username+"(f_id integer not null,msg text not null,flag smallint not null)",function(err4){
                                            if(err4){
                                                console.log(err4.toString());
                                                res.send("failed");
                                            }else{
                                                pool.query("alter table "+username+" add foreign key (f_id) references "+username+"_f(fr_id);",function(err5){
                                                    if(err5){
                                                        console.log(err5.toString());
                                                        res.send("failed");
                                                    }else{
                                                        res.send("sucess");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }else{
                console.log("User exist");
                res.send("failed");
            }
        }
    });
    //sucess/failed
});
app.post('/new/login',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    
    pool.query("SELECT * FROM usert WHERE name = $1",[username],function(err,result){
        if(err){
            console.log(err.toString());
            res.send("failed");
        }else{
            if(result.rows.length===0){
                res.send('username not exist');
            }else{
                var pString=result.rows[0].pass;
                var salt=pString.split('$')[2];
                var pHash=hash(password,salt);
                if(pHash===pString){
                    req.session.auth={userId:result.rows[0].name};
                    res.send('credentials are correct');
                }else{
                    res.send('username or password is invalid');
                }
            }
        }
    });
});

app.get('/new/logout',function(req,res){
    delete req.session.auth;
    res.sendFile(path.join(__dirname,'newChat','logoutRedirect.html'));
});
function checklogin(req){
    return (req.session&&req.session.auth&&req.session.auth.userId);
}
app.get('/new/check',function(req,res){
    var temp='no user found';
    if(checklogin(req)){
        temp='user '+req.session.auth.userId+' logged in'
    }
    res.send(temp);
});
app.get('/new/index',function(req,res){
    res.sendFile(path.join(__dirname,'newChat','login.html'));
});
app.get('/new/main',function(req,res){
    if(checklogin(req))
        res.sendFile(path.join(__dirname,'newChat','main.html'));
    else
        res.sendFile(path.join(__dirname,'newChat','redirect.html'));
});
app.get('/new/script.js',function(req,res){
    res.sendFile(path.join(__dirname,'newChat','script.js'));
});
app.get('/new/style.css',function(req,res){
    res.sendFile(path.join(__dirname,'newChat','style.css'));
});
app.get('/new/lscript.js',function(req,res){
    res.sendFile(path.join(__dirname,'newChat','lscript.js'));
});
app.get('/new/lstyle.css',function(req,res){
    res.sendFile(path.join(__dirname,'newChat','lstyle.css'));
});


app.get('/new/hash/:input',function(req,res){
    var hashValue=hash(req.params.input,'someRandomString');
    res.send(hashValue);
});
//-------


app.post('/new/chatlist',function(req,res){
    var friend=req.body.friend;
    var name=req.session.auth.userId.toString();
    if(checklogin(req)){
        var friendid;
        pool.query("SELECT * FROM "+name+"_f WHERE fr_name = $1",[friend],function(err,result){
            if(err){
                console.log(err.toString());
                res.send("failed");
            }else{
                friendid=result.rows[0].fr_id;
                pool.query("SELECT * FROM "+name+" WHERE f_id="+friendid,function(err1,result1){
                    if(err1){
                        console.log(err1.toString());
                        res.send("failed");
                    }else{
                        res.send(JSON.stringify(result1));
                    }
                });
            }
        });
    }else{
        res.send("failed");
    }
    //failed/result1
});

app.get('/new/friends',function(req,res){
    var name=req.session.auth.userId.toString();
    if(checklogin(req)){
        pool.query("SELECT * FROM "+name+"_f",function(err,result){
            if(err){
                console.log(err.toString());
                res.send("nonvalid");
            }else{
                if (result.rows.length===0) {
                    res.send("nonvalid");
                }else {
                    res.send(JSON.stringify(result.rows));
                }
            }
        });
    }else{
        res.send("nonvalid");
    }
    //valid/nonvalid
});

app.post('/new/send',function(req,res){
    var message=req.body.msg;
    var friend=req.body.friend;
    var user=req.session.auth.userId.toString();

    if(checklogin(req)){
        pool.query("SELECT * FROM usert WHERE name = $1",[friend],function(err,result){
            if(err){
                console.log(err.toString());
                res.send("failed");
            }else{
                if(result.rows.length===0){
                    res.send("failed");
                }else{
                    pool.query("SELECT * FROM "+user+"_f WHERE fr_name = $1",[friend],function(err1,result1){
                        if(err1){
                            console.log(err1.toString());
                            res.send("failed");
                        }else{
                            if(result1.rows.length===0){
                                res.send("failed");
                            }else{
                                pool.query("SELECT * FROM "+user+"_f WHERE fr_name = $1",[friend],function(err2,result2){
                                    if(err2){
                                        console.log(err2.toString());
                                        res.send("failed");
                                    }else{
                                        var friendid;
                                        friendid=result2.rows[0].fr_id;
                                        pool.query("SELECT * FROM "+friend+"_f WHERE fr_name = $1",[user],function(err3,result3){
                                            if(err3){
                                                console.log(err3.toString());
                                                res.send("failed");
                                            }else{
                                                var userid;
                                                userid=result3.rows[0].fr_id;
                                                pool.query("insert into "+user+" values($1,$2,'1')",[friendid,msg],function(err4){
                                                    if(err4){
                                                        console.log(err4.toString());
                                                    }
                                                });
                                                pool.query("insert into "+friend+" values($1,$2,'0')",[userid,msg],function(err5){
                                                    if(err5){
                                                        console.log(err5.toString());
                                                    }
                                                });
                                                pool.query("UPDATE "+friend+"_f SET msg_flag = 1 WHERE fr_name = $1",[user],function(err6){
                                                    if(err6){
                                                        console.log(err6.toString());
                                                    }
                                                });
                                                res.send("sucess");
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }else{
        res.send("failed");
    }
    //sucess/failed
});

app.post('/new/search',function(req,res){
    var friend=req.body.friend;
    var user=req.session.auth.userId.toString();

    if(checklogin(req)&&user!=friend){
        pool.query("SELECT * FROM usert WHERE name = $1",[friend],function(err,result){
            if(err){
                console.log(err.toString());
                res.send("notadded");
            }else{
                if(result.rows.length===0){
                    res.send("notadded");
                }else{
                    pool.query("insert into "+user+"_f (fr_name) values($1)",[friend],function(err1){
                        if(err1){
                            console.log(err1.toString());
                        }
                    });
                    pool.query("insert into "+friend+"_f (fr_name) values($1)",[user],function(err2){
                        if(err2){
                            console.log(err2.toString());
                        }
                    });
                    pool.query("UPDATE usert SET fr_flag = 1 WHERE name = $1",[friend],function(err3){
                        if(err3){
                            console.log(err3.toString());
                        }
                    });
                    res.send("added");
                }
            }
        });
    }else{
        res.send("notadded");
    }
    //notadded/added
});

app.get('/new/newf',function(req,res){
    var name=req.session.auth.userId.toString();
    if(checklogin(req)){
        pool.query("SELECT * FROM usert WHERE name = $1",[name],function(err,result){
            if(err){
                console.log(err.toString());
                res.send("nonew");
            }else{
                if (result.rows[0].fr_flag===1) {
                    pool.query("UPDATE usert SET fr_flag = 0 WHERE name = $1",[name],function(err1){
                        if(err1){
                            console.log(err1.toString());
                        }
                    });
                    res.send("new");
                }else {
                    res.send("nonew");
                }
            }
        });
    }else{
        res.send("nonew");
    }
    //new/nonew
});

app.post('/new/newmsg',function(req,res){
    var friend=req.body.friend;
    var name=req.session.auth.userId.toString();
    
    if(checklogin(req)){
        pool.query("SELECT * FROM "+name+"_f WHERE fr_name = $1",[friend],function(err,result) {
            if (err) {
                console.log(err.toString());
                res.send("nonew");
            }else {
                if (result.rows.length===0) {
                    res.send("nonew");
                }else {
                    if (result.rows[0].msg_flag===1) {
                        pool.query("UPDATE "+name+"_f SET msg_flag = 0 WHERE fr_name = $1",[friend],function(err1){
                            if(err1){
                                console.log(err1.toString());
                            }
                        });
                        res.send("new");
                    }else {
                        res.send("nonew");
                    }
                }
            }
        });
    }else{
        res.send("nonew");
    }
    //new/nonew
});



//newChat












app.get('/chat/chatlist',function(req,res){
    var name=req.query.n;
    var pass=req.query.p;
    var friend=req.query.f;
    pool.query("SELECT * FROM usert WHERE name = $1",[name],function(err,result){
        if(err){
            console.log("error");
            console.log(err.toString());
            res.send("failed");
        }else{
            if(result.rows.length===0){
                console.log("No user found");
                res.send("failed");
            }else{
                if(result.rows[0].pass===pass){
                    console.log("User matched");
                    var friendid;
                    pool.query("SELECT * FROM "+name+"_f WHERE fr_name = $1",[friend],function(err1,result1){
                        if(err1){
                            console.log(err1.toString());
                            res.send("failed");
                        }else{
                            friendid=result1.rows[0].fr_id;
                            pool.query("SELECT * FROM "+name+" WHERE f_id="+friendid,function(err2,result2){
                                if(err2){
                                    console.log("error");
                                    console.log(err2.toString());
                                    res.send("failed");
                                }else{
                                    console.log("sucess");
                                    res.send(JSON.stringify(result2));
                                }
                            });
                        }
                    });
                }
                else{
                    console.log("User not matched");
                    res.send("failed");
                }
            }
        }
    });
});

app.get('/chat/friends',function(req,res){
    var name=req.query.n;
    var pass=req.query.p;
    pool.query("SELECT * FROM usert WHERE name = $1",[name],function(err,result){
        if(err){
            console.log("error");
            console.log(err.toString());
            res.send("nonvalid");
        }else{
            if(result.rows.length===0){
                console.log("No user found");
                res.send("nonvalid");
            }else{
                if(result.rows[0].pass===pass){
                    console.log("User matched");
                    pool.query("SELECT * FROM "+name+"_f",function(err1,result1){
                        if(err){
                            console.log("error");
                            console.log(err1.toString());
                            res.send("nonvalid");
                        }else{
                            if (result1.rows.length===0) {
                                res.send("nonvalid");
                            }else {
                                console.log("sucess");
                                res.send(JSON.stringify(result1.rows));
                            }
                        }
                    });
                }
                else{
                    console.log("User not matched");
                    res.send("nonvalid");
                }
            }
        }
    });
});

app.get('/chat/main.html',function(req,res){
    res.sendFile(path.join(__dirname,'chat','main.html'));
});

app.get('/chat/script.js',function(req,res){
    res.sendFile(path.join(__dirname,'chat','script.js'));
});

app.get('/chat/style.css',function(req,res){
    res.sendFile(path.join(__dirname,'chat','style.css'));
});

app.get('/chat/testing',function(req,res){
    console.log("testing the app");
    res.send("Testing");
});

app.get('/chat/validate',function(req,res){
    var name=req.query.n;
    var pass=req.query.p;
    pool.query("SELECT * FROM usert WHERE name = $1",[name],function(err,result){
        if(err){
            console.log("error");
            console.log(err.toString());
            res.send("nonvalid");
        }else{
            if(result.rows.length===0){
                console.log("No user found");
                res.send("nonvalid");
            }else{
                if(result.rows[0].pass===pass){
                    console.log("User matched");
                    res.send("valid");
                }
                else{
                    console.log("User not matched");
                    res.send("nonvalid");
                }
            }
        }
    });
});

app.get('/chat/create',function(req,res){
    var name=req.query.n;
    var pass=req.query.p;
                //on id and pass not exist, create and return "sucess"
                //else return "failed"
    pool.query("SELECT * FROM usert WHERE name = $1",[name],function(err,result){
        if(err){
            console.log(err.toString());
            res.send("failed");
	      }else{
            if(result.rows.length===0){
                console.log("User does not exist");
                pool.query("insert into usert values($1,$2)",[name,pass],function(err1){
                    if(err1){
                        console.log("Unable to insert into usert table");
                        res.send("failed");
        	          }else{
        		            console.log("inserted into usert table");
                        pool.query("create table "+name+"_f(fr_name text not null primary key,fr_id serial not null unique,msg_flag smallint not null DEFAULT '0')",function(err2){
                            if(err2){
                                console.log("Unable to create "+name+"_f table");
                                res.send("failed");
                	          }else{
                		            console.log(name+"_f table created");
                                pool.query("alter table "+name+"_f add foreign key (fr_name) references usert(name)",function(err3){
                                    if(err3){
                                        console.log("Unable to add foreign key to "+name+"_f table");
                                        res.send("failed");
                        	          }else{
                        		            console.log(name+"_f foreign key added");
                                        pool.query("create table "+name+"(f_id integer not null,msg text not null,flag smallint not null)",function(err4){
                                            if(err4){
                                                console.log("Unable to create "+name+" table");
                                                res.send("failed");
                                	          }else{
                                		            console.log(name+" table created");
                                                pool.query("alter table "+name+" add foreign key (f_id) references "+name+"_f(fr_id);",function(err5){
                                                    if(err5){
                                                        console.log("Unable to add foreign key to "+name+" table");
                                                        res.send("failed");
                                        	          }else{
                                        		            console.log(name+" foreign key added");
                                                        res.send("sucess");
                                        	          }
                                        	      });
                                	          }
                                	      });
                        	          }
                        	      });
                	          }
                	      });
        	          }
        	      });
            }else{
                console.log("User exist");
                res.send("failed");
            }
        }
    });
});

app.get('/chat/send',function(req,res){
    var user=req.query.n;
    var pass=req.query.p;
    var msg=req.query.c;
    var friend=req.query.to;

    //simply return query responce

    pool.query("SELECT * FROM usert WHERE name = $1",[user],function(err,result){
        if(err){
            console.log(err.toString());
            res.send("failed");
        }else{
            if(result.rows.length===0){
                console.log("authentic user not found");
                res.send("failed");
            }else{
                if(result.rows[0].pass===pass){
                    console.log("User is authentic");
                    pool.query("SELECT * FROM usert WHERE name = $1",[friend],function(err1,result1){
                        if(err1){
                            console.log(err1.toString());
                            res.send("failed");
                        }else{
                            if(result1.rows.length===0){
                                console.log("friend user not found");
                                res.send("failed");
                            }else{
                                console.log("friend user is found");
                                pool.query("SELECT * FROM "+user+"_f WHERE fr_name = $1",[friend],function(err2,result2){
                                    if(err2){
                                        console.log(err2.toString());
                                        res.send("failed");
                                    }else{
                                        if(result2.rows.length===0){
                                            console.log("friend is not truefriend of user");
                                            res.send("failed");
                                        }else{
                                            console.log("friend is truefriend of user");
                                            pool.query("SELECT * FROM "+user+"_f WHERE fr_name = $1",[friend],function(err3,result3){
                                                if(err3){
                                                    console.log(err3.toString());
                                                    res.send("failed");
                                                }else{
                                                    var friendid;
                                                    friendid=result3.rows[0].fr_id;
                                                    pool.query("SELECT * FROM "+friend+"_f WHERE fr_name = $1",[user],function(err4,result4){
                                                        if(err4){
                                                            console.log(err4.toString());
                                                            res.send("failed");
                                                        }else{
                                                            var userid;
                                                            userid=result4.rows[0].fr_id;
                                                            pool.query("insert into "+user+" values($1,$2,'1')",[friendid,msg],function(err5){
                                                                if(err5){
                                                                    console.log("Unable to insert into user table");
                                                                }else{
                                                                    console.log("inserted into user table");
                                                                }
                                                            });
                                                            pool.query("insert into "+friend+" values($1,$2,'0')",[userid,msg],function(err6){
                                                                if(err6){
                                                                    console.log("Unable to insert into friend table");
                                                                }else{
                                                                    console.log("inserted into friend table");
                                                                }
                                                            });
                                                            pool.query("UPDATE "+friend+"_f SET msg_flag = 1 WHERE fr_name = $1",[user],function(err7){
                                                                if(err7){
                                                                    console.log("Unable to insert flag into "+friend+"_f table for "+user);
                                                                }else{
                                                                    console.log("inserted flag into "+friend+"_f table for "+user);
                                                                }
                                                            });
                                                            res.send("sucess");
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
                else{
                    console.log("User is not authentic");
                    res.send("failed");
                }
            }
        }
    });
});

app.get('/chat/search',function(req,res){
    var user=req.query.n;
    var pass=req.query.p;
    var friend=req.query.f;

    if (user!=friend) {
        pool.query("SELECT * FROM usert WHERE name = $1",[user],function(err,result){
            if(err){
                console.log(err.toString());
                res.send("notadded");
            }else{
                if(result.rows.length===0){
                    console.log("authentic user not found");
                    res.send("notadded");
                }else{
                    if(result.rows[0].pass===pass){
                        console.log("User is authentic");
                        pool.query("SELECT * FROM usert WHERE name = $1",[friend],function(err1,result1){
                            if(err1){
                                console.log(err.toString());
                                res.send("notadded");
                            }else{
                                if(result1.rows.length===0){
                                    console.log("friend user not found");
                                    console.log(result1.rows.length);
                                    res.send("notadded");
                                }else{
                                    console.log("friend user is found");
                                    pool.query("insert into "+user+"_f (fr_name) values($1)",[friend],function(err2){
                                        if(err2){
                                            console.log("Unable to insert into "+user+"_f table");
                                        }else{
                                            console.log("inserted into "+user+"_f table");
                                        }
                                    });
                                    pool.query("insert into "+friend+"_f (fr_name) values($1)",[user],function(err3){
                                        if(err3){
                                            console.log("Unable to insert into "+friend+"_f table");
                                        }else{
                                            console.log("inserted into "+friend+"_f table");
                                        }
                                    });
                                    pool.query("UPDATE usert SET fr_flag = 1 WHERE name = $1",[friend],function(err4){
                                        if(err4){
                                            console.log("Unable to insert flag into usert table");
                                        }else{
                                            console.log("inserted flag into usert table");
                                        }
                                    });
                                    res.send("added");
                                }
                            }
                        });
                    }
                    else{
                        console.log("User is not authentic");
                        res.send("notadded");
                    }
                }
            }
        });
    }else {
        console.log("friend and user are same");
    }
});

app.get('/chat/newf',function(req,res){
    var name=req.query.n;
    var pass=req.query.p;
    pool.query("SELECT * FROM usert WHERE name = $1",[name],function(err,result){
        if(err){
            console.log("error");
            console.log(err.toString());
            res.send("nonew");
        }else{
            if(result.rows.length===0){
                console.log("No user found");
                res.send("nonew");
            }else{
                if(result.rows[0].pass===pass){
                    console.log("User matched");
                    if (result.rows[0].fr_flag===1) {
                        pool.query("UPDATE usert SET fr_flag = 0 WHERE name = $1",[name],function(err1){
                            if(err1){
                                console.log("Unable to delete flag in usert table for "+name);
                            }else{
                                console.log("deleted flag in usert table for "+name);
                            }
                        });
                        res.send("new");
                    }else {
                        res.send("nonew");
                    }
                }
                else{
                    console.log("User not matched");
                    res.send("nonew");
                }
            }
        }
    });
});

app.get('/chat/newmsg',function(req,res){
    var name=req.query.n;
    var pass=req.query.p;
    var friend=req.query.f;
    pool.query("SELECT * FROM usert WHERE name = $1",[name],function(err,result){
        if(err){
            console.log("error");
            console.log(err.toString());
            res.send("nonew");
        }else{
            if(result.rows.length===0){
                console.log("No user found");
                res.send("nonew");
            }else{
                if(result.rows[0].pass===pass){
                    console.log("User matched");
                    pool.query("SELECT * FROM "+name+"_f WHERE fr_name = $1",[friend],function(err1,result1) {
                        if (err1) {
                            console.log(err1.toString());
                            res.send("nonew");
                        }else {
                            if (result1.rows.length===0) {
                                console.log("No friend found");
                                res.send("nonew");
                            }else {
                                if (result1.rows[0].msg_flag===1) {
                                    pool.query("UPDATE "+name+"_f SET msg_flag = 0 WHERE fr_name = $1",[friend],function(err2){
                                        if(err2){
                                            console.log("Unable to delete flag in "+name+"_f table for "+friend);
                                        }else{
                                            console.log("deleted flag in "+name+"_f table for "+friend);
                                        }
                                    });
                                    res.send("new");
                                }else {
                                    res.send("nonew");
                                }
                            }
                        }
                    });
                }
                else{
                    console.log("User not matched");
                    res.send("nonew");
                }
            }
        }
    });
});




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


