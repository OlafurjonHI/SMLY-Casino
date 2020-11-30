const FW = require('../helpers/filewriter');
const fetch = require('node-fetch');
const Player = require('./player');
const commands = {
    "balance": "getbalance?account=SMLYCASINO"
}
class Casino {
    constructor(server){
        this.account = "SMLYCASINO"
        this.address = "B6uriySEvqdQYF1GX6XDuf4f6QriYPRgav"
        this.totalAmount = 0;
        this.totalOwed = 0;
        this.playerFile = "files/players.json";
        this.casinoFile = "files/casino.json";
        this.players = {}
        this.casinoServer = server;
        let obj = JSON.parse(FW.readObjFromFile(this.casinoFile))
        if(FW.validatePath(this.casinoFile) && Object.values(obj).length > 0){
            this.casinoRestore(obj)
        }
        this.updateCasinoBalance();
        this.initPlayerFile();
        this.updatePlayersBalance();

    }

    casinoRestore(obj){
        this.account = obj.account;
        this.address = obj.address;
        this.totalOwed = obj.totalOwed;
        this.playerFile = obj.playerFile;
        this.casinoFile = obj.casinoFile;
    }
    setCasinoServer(server) {this.casinoServer = server};
    getCasinoBalance(){return this.totalAmount;}
    getCasinoOwed() {return this.totalOwed};
 
    getCurrentStanding(){
        if(this.totalOwed >= 0)
            return this.totalAmount - this.totalOwed;
        else 
            return this.totalAmount + this.totalOwed;
    }

    transferWinningsToAccount(username,amount){
        if(amount <= this.getCurrentStanding() ){
            console.log("Bank transferring")
            this.getPlayer(username)["currentWinnings"] += parseFloat(amount)
            this.totalOwed -= parseFloat(amount);
        }
        else {
            console.log("Bank Cant transfer")
        }
    }
    transferWinningsToCasino(username,amount){
        if(amount <= this.getPlayerBalance(username) ){
            console.log("User transferring")
            this.getPlayer(username)["currentWinnings"] -= parseFloat(amount)
            this.totalOwed += parseFloat(amount);
        }
        else  
            console.log("User cant transfer")
    }

    transferFromCasino(shellcommand,username,amount){
        amount = parseFloat(amount)
        let orgAddress = this.players[username]["orgAddress"];
        let check = false;
        let emptyAll = false;
        let ownedAmount = parseFloat(this.getPlayerBalance(username))
        if(amount > ownedAmount){
            console.error("Insufficient Funds")
            return false
        }
        if(ownedAmount - amount === 0){
            check = true;
            emptyAll = true;
        }
        else if(ownedAmount > amount){
            check = true;
            emptyAll = false;
        }
        try{
            if(check === true){
                let playerwinnings = parseFloat(this.players[username]["currentWinnings"])
                if(emptyAll){
                    let command1 = `sendfrom "${this.account}" "${orgAddress}" ${playerwinnings} 6 "Withdrawal from ${this.account}" "To ${username}"`
                    let command2 = `sendfrom "${ this.players[username]["username"]}" "${orgAddress}" ${parseFloat(this.players[username]["currentFunds"])} 6 "Withdrawal from ${ this.players[username]}" "To ${ this.players[username]["orgAddress"]}"`
                    shellcommand(command1).then(
                        res => console.log(res)
                    )
                    shellcommand(command2).then(
                        res => console.log(res)
                    )
                    this.totalOwed += parseFloat(this.players[username]["currentWinnings"])
                    this.currentFunds -= parseFloat(this.players[username]["currentFunds"])
                    this.players[username]["currentWinnigs"] = 0;
                    this.players[username]["currentFunds"] = 0;
                }
                else {
                    if(playerwinnings >= amount){
                        let command1 = `sendfrom "${this.account}" "${orgAddress}" ${amount} 6 "Withdrawal from ${this.account}" "To ${username}"`
                        console.log(command1)
                        shellcommand(command1).then(
                            res => console.log(res)
                        )
                       
                        this.players[username]["currentWinnings"] -= amount
                        this.totalOwed += amount
                    }
                    if(amount > playerwinnings){
                        let difference = amount - playerwinnings;
                        difference = parseFloat(difference)
                        let command1 = `sendfrom "${this.account}" "${orgAddress}" ${playerwinnings} 6 "Withdrawal from ${this.account}" "To ${username}"`
                        console.log(command1)
                        shellcommand(command1).then(
                            res => console.log(res)
                        )
                        this.players[username]["currentWinnings"] = 0;
                        this.totalOwed += playerwinnings
                       
                        let command2 = `sendfrom "${ this.players[username]["username"]}" "${orgAddress}" ${difference} 6 "Withdrawal from ${ this.players[username]}" "To ${ this.players[username]["orgAddress"]}"`
                        console.log(command2)
                        shellcommand(command2).then(
                            res => console.log(res)
                        )
                        this.players[username]["currentFunds"] -= difference
                        this.currentFunds -= difference
                    }
                }
                return check;
            }
            else {
                return check;
            }
        
        }catch{
            check = false;
            console.log("Failed the try")
            console.error("Error processing request")
        }
 
        return check
    }

    createNewPlayer(shellcommand,username,password,address){
        shellcommand(`getnewaddress ${username}`).then(res => {
            let casinoaddress = (res.stdout).trim()
            this.addPlayer(username,password,address,casinoaddress,0,0)
            FW.writeObjToFile(this.playerFile,this.players)
       
        })
    }

    addPlayer(username,password,orgAddress,casinoAddress,currentFunds,currentWinnings){ 
        this.players[username] = {
            "username" : username,
            "password" : password,
            "orgAddress" : orgAddress,
            "casinoAddress" : casinoAddress,
            "currentFunds" : currentFunds,
            "currentWinnings" : currentWinnings
        }
    }

    getPlayer(username){
        return this.players[username];
    }
    
    showPlayers(){ console.log(this.players)}

  

    getPlayers(){ return this.players}

    initPlayerFile(){
        let playerlist = JSON.parse(FW.readObjFromFile(this.playerFile))
        console.log("playerinit: " + playerlist)
        if(!playerlist || Object.values(playerlist).length === 0)
            return
        for (const [key, value] of Object.entries(playerlist)) {
            this.players[key] = value;
        }
        
    }

    updateCasinoBalance(){
        let url = `${this.casinoServer}${commands['balance']}`
        fetch(url).then(res => {
            if(res.status !== 200) console.error("Failed")
            return res.json();
        }).then(resp => {
            this.totalAmount = parseFloat(resp)
        }
        ).catch(error =>console.log("error getting funds" + error))
    }

    getPlayerBalance(username) {
        let currentFunds = parseFloat(this.players[username]["currentFunds"])
        let currentWinnings = parseFloat(this.players[username]["currentWinnings"])
        return currentFunds + currentWinnings
    }

    updatePlayerBalance(username){
        let url = `${this.casinoServer}getbalance?account=${username}`
        fetch(url).then(res => {
            if(res.status !== 200) console.error("Failed")
            return res.json();
        }).then(resp => {
            this.players[username]["currentFunds"] = parseFloat(resp)
        }).catch(error =>console.log("error getting funds" + error))
        FW.writeObjToFile(this.playerFile,this.players) 
    }

    updatePlayersBalance(){
        for (const [key, value] of Object.entries(this.players)) {
            this.updatePlayerBalance(key)
        }
    }

    verifyPlayer(username,password){
        if(this.players[username])
            if(this.players[username]['password'] === password)
                return this.players[username]
        return null;
    }

}

module.exports = Casino;