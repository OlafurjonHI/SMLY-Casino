const express = require('express');
const session = require('express-session');
const app = express();
const path = require("path")
const bodyParser = require('body-parser');


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(session({secret:'SMLYSECRET'}));
app.use(bodyParser.json())

const ShellCommand = require('./execshell');
const FW = require('./helpers/filewriter');
const Casino = require('./casino');
const Player = require('./player')

const port = 1337
app.listen(port ,() =>{
    console.log(`Server started on port: ${port}`)
})

let casino = new Casino();

let ssn;

app.get("/", (req,res)=> {
    ssn = req.session;
    res.render("index",{
        player: ssn.currentPlayer
    });
    casino.getCasinoBalance(ShellCommand)
})



app.get("/showplayers", (req,res)=> {
    ssn = req.session;
    casino.showPlayers();
})

app.get("/playerBalance", (req,res)=> {
    ssn = req.session;
    casino.getPlayerBalance(ShellCommand,ssn.currentPlayer)

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
    if(player)
        ssn.currentPlayer = player;
        
    res.render("login",{
        player: ssn.currentPlayer
    });
})


app.get("/signup", (req,res)=> {
    ssn = req.session;
    res.render("signup",{
        player: ssn.currentPlayer
    });
})



app.post("/signup",bodyParser.urlencoded({extended:false}), (req,res)=> {
    console.log(req.body);
    ssn = req.session;
    let { username, password, address } = req.body;
    let playerlist = FW.readObjFromTile(casino.getPlayersList()).playerlist;
    let filtered = playerlist.filter(p => p.username.toLowerCase() === username.toLowerCase())
    if(filtered.length === 0){
        let player = new Player(username,password,address)
        casino.getNewAddressforPlayer(ShellCommand,player)
        ssn.currentPlayer = player;
    }    
    res.render("signup",{
        player: ssn.currentPlayer
     })
})



app.get("/help", (req,res)=> {
        ssn = req.session;
    res.render("help",{
        player: ssn.currentPlayer
    })
})

app.get("/gethelp", (req,res)=> {
    ShellCommand("help").then(
         ret => {
             let arr = ret.stdout.split('\n')
             console.log(arr.length)
             return res.json(arr)
         })
 
 })
