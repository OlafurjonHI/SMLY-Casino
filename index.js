//Packages
const express = require('express');
const session = require('express-session');
const path = require("path")
const bodyParser = require('body-parser');

//app config
const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret:'SMLYSECRET',
    name:'smly_cookie',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json())
app.use((req,res,next) => {
    res.locals.urlDomain = `${req.protocol}://${req.get('host')}/`
    next();
})

//Entities and Helpers
const ShellCommand = require('./execshell');
const FW = require('./helpers/filewriter');
const Casino = require('./entities/casino')
const Deck = require('./entities/deck');
const Card = require('./entities/card');
const { Console } = require('console');

let casino = new Casino("http://localhost:1337/");
let ssn;
const port = 1337

app.listen(port ,() =>{
    console.log(`Server started on port: ${port}`)
    
    FW.writeObjToFile(casino.casinoFile,casino)
})


app.get("/", (req,res)=> {
    ssn = req.session;
    res.render("index",{
        player: ssn.currentPlayer
    });
})



app.get("/playerinfo", (req,res)=> {
    ssn = req.session;
    if(ssn.currentPlayer == null)
        res.redirect('/')
    else {
    
    FW.writeObjToFile(casino.playerFile, casino.players)
    res.render("playerinfo", {
        player: ssn.currentPlayer,
        totalAmount: casino.getPlayerBalance(ssn.currentPlayer["username"])
    });
    }
})

app.post("/playerinfo", (req,res)=> {
    ssn = req.session;
    if(ssn.currentPlayer == null)
        res.redirect('/')
    else {
    casino.updatePlayerBalance(ssn.currentPlayer['username'])
    FW.writeObjToFile(casino.playerFile, casino.players)
    res.render("playerinfo", {
        player: ssn.currentPlayer,
        totalAmount: casino.getPlayerBalance(ssn.currentPlayer["username"])
    });
    }
})

app.get("/login", (req,res)=> {
    ssn = req.session;
    res.render("login",{
        player: ssn.currentPlayer
    });
})

app.post("/login",bodyParser.urlencoded({extended:false}), (req,res)=> {
    ssn = req.session;
    console.log(req.body)
    const { username,password} = req.body;
    let player = casino.verifyPlayer(username,password);
    console.log(player)
    if(player){
        ssn.currentPlayer = player;
        console.log(app.locals.urlDomain)
        res.redirect("/playerinfo")
    }
    else {
        res.render("login",{
            player: ssn.currentPlayer
        });
    }
})


app.get("/signup", (req,res)=> {
    ssn = req.session;
    res.render("signup",{
        player: ssn.currentPlayer
    });
})



app.post("/signup",bodyParser.urlencoded({extended:false}), (req,res)=> {
    ssn = req.session;
    let { username, password, address} = req.body;
    if(casino.getPlayers[username])
        return
    casino.createNewPlayer(ShellCommand,username,password,address)
    FW.writeObjToFile(casino.casinoFile,casino);
    FW.writeObjToFile(casino.playerFile,casino.players)
    ssn.currentPlayer = casino.getPlayer(username); 
    res.render("signup",{
        player: ssn.currentPlayer
     })
})


app.get("/logout", (req,res) => {
    ssn = req.session;
    ssn.currentPlayer = null;
    res.redirect("/")
})

app.get("/help", (req,res)=> {
        ssn = req.session;
    res.render("help",{
        player: ssn.currentPlayer
    })
})

//Game Corner

app.get("/games/highorlow", (req,res)=> {
    ssn = req.session;
    if(ssn.currentPlayer == null)
        res.redirect('/')
    else {
        let deck 
        let drawncard;
        if(ssn.deck == null || ssn.deck.deck.length <= 42){
            deck = new Deck();
            deck.shuffleDeck();
            drawncard = deck.drawCard();
            ssn.deck = deck;
        } else {
            deck = new Deck((ssn.deck.deck))
            drawncard = deck.drawCard();
            ssn.deck = deck
        }
        
        let total = parseInt(casino.getPlayerBalance(ssn.currentPlayer["username"]))
        res.render("highorlow",{
            player: ssn.currentPlayer,
            card: drawncard,
            deck: ssn.deck,
            totalAmount: total
        });
    }
})







 //Casino Requests:
 app.get("/getbalance", bodyParser.urlencoded({extended:false}),(req,res)=> {
    const { account } = req.query;
    ShellCommand(`getbalance ${account}`).then(
         ret => {
             return res.json(parseFloat(ret.stdout))
         })
 })


 app.get("/gethelp", (req,res)=> {
    ShellCommand("help").then(
         ret => {
             let arr = ret.stdout.split('\n')
             return res.json(arr)
         })
 })




