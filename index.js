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
const Blackjack = require('./entities/casino')
const Deck = require('./entities/deck');
const Card = require('./entities/card');


let casino = new Casino("http://localhost:1337/");

let ssn;
const port = 1337

app.listen(port ,() =>{
    console.log(`Server started on port: ${port}`)
    casino.updateCasinoBalance();
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
        console.log(ssn.currentPlayer)
        let player =casino.getPlayer(ssn.currentPlayer['username'])
        casino.updatePlayerBalance(player['username'])
        ssn.currentPlayer = player
        FW.writeObjToFile(casino.playerFile, casino.players)
        FW.writeObjToFile(casino.casinoFile,casino)
        res.render("playerinfo", {
            player: ssn.currentPlayer,
            totalAmount: casino.getPlayerBalance(ssn.currentPlayer["username"])
        });
    }
})

app.post("/cashout", bodyParser.urlencoded({extended:false}),(req,res)=> {
    ssn = req.session;
    if(ssn.currentPlayer == null)
        res.redirect('/')
    else {
        const { amount} = req.body;
        if(amount < 0){
            redirect('/playerinfo')
        }
        let result = casino.transferFromCasino(ShellCommand,ssn.currentPlayer["username"],amount)
        console.log(`Result: ${result}`)
        if(result){
            casino.updateCasinoBalance()
            let player =casino.getPlayer(ssn.currentPlayer['username'])
            casino.updatePlayerBalance(player['username'])
            ssn.currentPlayer = player
            FW.writeObjToFile(casino.casinoFile,casino)
            FW.writeObjToFile(casino.playerFile,casino.players)
        }
        res.redirect('/playerinfo')
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

app.get("/casino", (req,res)=> {
    ssn = req.session;
    casino.updateCasinoBalance();
res.render("casino",{
    player: ssn.currentPlayer,
    casino: casino
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

        if(ssn.currentDrawnCard){
            deck = new Deck((ssn.deck.deck))
            ssn.deck = deck
            const {rank, suit} = ssn.currentDrawnCard
            let drawncard = new Card(suit,rank)
            let total = parseInt(casino.getPlayerBalance(ssn.currentPlayer["username"]))
            ssn.message == "Welcome Back"
            res.render("highorlow",{
                player: ssn.currentPlayer,
                card: drawncard,
                deck: ssn.deck,
                totalAmount: total,
                msg: ssn.message,
            });
        }
        else {
        
            if(ssn.deck == null || ssn.deck.deck.length <= 42){
                deck = new Deck();
                deck.shuffleDeck();
                drawncard = deck.drawCard();
                ssn.message = `New Game \nFirst card is: ${drawncard.toString()}\n`
                ssn.deck = deck;
            } else {
                deck = new Deck((ssn.deck.deck))
                drawncard = deck.drawCard();
                ssn.message += `Next card is: ${drawncard.toString()}\n`
                ssn.deck = deck
            }
            ssn.currentDrawnCard = drawncard
            let total = parseInt(casino.getPlayerBalance(ssn.currentPlayer["username"]))
            FW.writeObjToFile(casino.playerFile,casino.players)
            FW.writeObjToFile(casino.casinoFile,casino)
            res.render("highorlow",{
                player: ssn.currentPlayer,
                card: drawncard,
                deck: ssn.deck,
                totalAmount: total,
                msg: ssn.message,
            });
        }
    }
})

app.post("/games/highorlow",bodyParser.urlencoded({extended:false}), (req,res)=> {
    ssn = req.session;
    if(ssn.currentPlayer == null)
        res.redirect('/')
    else {
        const {rank, suit} = ssn.currentDrawnCard
        let oldcard = new Card(suit,rank)
        let total = parseInt(casino.getPlayerBalance(ssn.currentPlayer["username"]))
        let { amount, highlow } = req.body;
        if(amount > total || amount < 0){
            let deck = new Deck((ssn.deck.deck))
            ssn.message  += `You dont have ${amount} to spend\nTry Again or transfer funds to ${ssn.currentPlayer['casinoAddress']}\n` 
            FW.writeObjToFile(casino.playerFile,casino.players)
            FW.writeObjToFile(casino.casinoFile,casino)
            res.render("highorlow",{
                player: ssn.currentPlayer,
                card: oldcard,
                deck: deck,
                totalAmount: total,
                error: error,
                msg: ssn.message
            });
            return;
        }
 
        let deck,drawncard
        if(ssn.deck == null || ssn.deck.deck.length <= 42){
            deck = new Deck();
            deck.shuffleDeck();
            drawncard = deck.drawCard();
            ssn.deck = deck;
            ssn.message = `New Game \nFirst card is: ${drawncard.toString()}\n`
        } else {
            deck = new Deck((ssn.deck.deck))
            drawncard = deck.drawCard();
            ssn.deck = deck
            ssn.message += `Next card is: ${drawncard.toString()}\n`
        }
        highlow = parseInt(highlow)
        oldrank = oldcard.getPureRank()
        newrank = drawncard.getPureRank()
        if(highlow > oldrank){
            ssn.message += `You guessed higher\n`
            if(oldrank < newrank){
                casino.transferWinningsToAccount(ssn.currentPlayer["username"],amount)
                ssn.message += `Congratulations Adding: ${amount} to your winnings\n`
            }
            else {
                casino.transferWinningsToCasino(ssn.currentPlayer["username"],amount)
                ssn.message += `To bad... transferring: ${amount} from your account\n`
            }
        }
        else if(highlow < oldrank){
            ssn.message += `You guessed lower\n`
            if(oldrank > newrank){
                casino.transferWinningsToAccount(ssn.currentPlayer["username"],amount)
                ssn.message += `Congratulations Adding: ${amount} to your winnings\n`
            }
            else {
                casino.transferWinningsToCasino(ssn.currentPlayer["username"],amount)
                ssn.message += `To bad... transferring: ${amount} from your account\n`
            }
        }
        else if(oldrank === newrank){
            casino.transferWinningsToCasino(ssn.currentPlayer["username"],amount)
            ssn.message += `To bad... transferring: ${amount} from your account`
        }
        ssn.currentPlayer = casino.getPlayer(ssn.currentPlayer["username"])
        ssn.currentDrawnCard = drawncard
        total = parseInt(casino.getPlayerBalance(ssn.currentPlayer["username"]))
        FW.writeObjToFile(casino.playerFile,casino.players)
        FW.writeObjToFile(casino.casinoFile,casino)
        res.render("highorlow",{
            player: ssn.currentPlayer,
            card: drawncard,
            deck: ssn.deck,
            totalAmount: total,
            error: null,
            msg: ssn.message
        });
    }
})

app.get("/games/blackjack", (req,res)=> {
    ssn = req.session;
    if(ssn.blackjack == null){
        let blackjack = new Blackjack();
        ssn.blackjack = blackjack;
    }
    if(ssn.currentPlayer == null)
        res.redirect('/')
    else {
        ssn.message = `Welcome\n Please place a bet to start \n`
        let total = parseInt(casino.getPlayerBalance(ssn.currentPlayer["username"]))
        res.render("blackjack",{
            player: ssn.currentPlayer,
            totalAmount: total,
            playerHand: null,
            dealerHand: null,
            playerHandTotal: 0,
            dealerHandTotal: 0,
            msg: ssn.message,
        });
    }
});




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

 

 app.get("*",(req, res) => {
    res.status(404);
    ssn = req.session;
  
    if (req.accepts('html')) {
      res.render('404', { url: req.url,player: ssn.currentPlayer });
      return;
    }
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }
    res.type('txt').send('Not found');
});


