var express= require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportlocalmongoose = require("passport-local-mongoose");
var Admin = require("./models/admin");
var alert = require("alert-node");
var app = express();


mongoose.connect("mongodb+srv://root:root123@cluster0-niwpu.mongodb.net/test?retryWrites=true",{useNewUrlParser : true});

//-------------------------------------app config-------------------------------------------

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

var userSchema = new mongoose.Schema({
    name : String,
    team_name : String,
    points : Number
})

var User = mongoose.model("User",userSchema);

//---------------------------------passport config----------------------------------------

app.use(require("express-session")({
    secret : "Winter is coming",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

//----------------------------Basic routes------------------------------------------------

app.get('/',function(req,res){
    User.find({},function(err,users){
        if(err){
            console.log("Can not find cats");
        }
        else{
            res.render("home.ejs",{users:users});
        }
    }).sort({points:-1})
})
//-----------------------------------------------------------------------------------------
app.get('/admin',isLoggedIn,function(req,res){
    User.find({},function(err,users){
        if(err){
            console.log("Can not find cats");
        }
        else{
            res.render("admin.ejs",{users:users});
        }
    }).sort({points:-1})
})
//-----------------------------------------------------------------------------------------
app.get('/admin/edit',isLoggedIn,function(req,res){
    User.find({},function(err,users){
        if(err){
            console.log("Can not find cats");
        }
        else{
            res.render("edit.ejs",{users:users});
        }
    }).sort({points:-1})
})
//------------------------------------------------------------------------------------------
app.post('/admin/edit',function(req,res){
    var body = req.body;
    var nam = req.body.name;
    var team_nam = req.body.team_name;
    var pts = req.body.points;
    var new_user = new User(
        {
            name : nam,
            team_name : team_nam,
            points : pts
        }
    ).save(function(err){
        if(err){
            console.log("failed to add");
            res.send("Process failed");
        }
        else{
            res.redirect("/admin");
        }
    })
})
//--------------------------------------------------------------------------------------------
app.put('/edit',function(req,res){
    var id = req.body.name;
    var oldPoint = 0;
    var add = 0;
    var sub =0;
    User.findById(id,function(err,user){
        if(err){
            console.log("unable to find user");
        }
        else{
            var oldPoint = user.points;
            add = Number(req.body.add) + oldPoint;
            sub = add - Number(req.body.sub)
            User.findByIdAndUpdate(id,{points:sub},function(err,updated){
                if(err){
                    console.log("Failed to update");
                }
                else{
                    console.log(updated);
                    res.redirect("/admin");
                }
            })
        }
    })
})


//----------------------------------Auth routes--------------------------------------------
app.get("/register",function(req,res){
    res.render("reg.ejs");
})
app.post("/register",function(req,res){
    var newUser = new Admin({username:req.body.username})
    Admin.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log("error in user registration");
            alert("User already exists");
            res.render("reg.ejs");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/admin");
        })
    })
})
//-----------------------------------------------------------------------------------------
app.get("/login",function(req,res){
    res.render("login.ejs");
})
app.post("/login",passport.authenticate("local",{
    successRedirect : "/admin",
    failureRedirect : "/login"
}),function(req,res){

})
//-----------------------------------------------------------------------------------------
app.get("/logout",function(req,res){
    req.logout();
    alert("Logged out successfully");
    res.redirect("/");
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//-----------------------------------------------------------------------------------------
app.listen(8000,function(err){
    if(err){
        console.log("server connection failed");
    }
    else{
        console.log("Server fired @8000");
    }
})

// var kumm = new User({
//     name : "arjun",
//     team_name : "IPS",
//     points : 8
// }).save(function(err){
//     if(err){
//         console.log("not added");
//     }
//     else{
//         console.log("kumm added");
//     }
// })