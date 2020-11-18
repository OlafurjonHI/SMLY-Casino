const FW = require('../helpers/filewriter');
const fetch = require('node-fetch');
const Player = require('./player');
const commands = {
    "balance": "getbalance?account=SMLYCASINO"
}
class Casino {
    constructor(server){
        this.account = "SMLYCASINO"
        this.address = "BPYKcpotu8KgHMSYmrjT9ZzjMXhiY6CDjR"
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
        return this.totalAmount - this.totalOwed;
    }

    transferWinningsToAccount(player,amount){
        if(amount <= this.getCurrentStanding() ){
            player.currentWinnings += amount
            this.totalOwed + amount;
        }
    }

    tranferFromCasino(shellcommand,to,amount,comment,commentTo){
        shellcommand(`sendfrom "${this.account}" "${to}" ${amount} 6 "${comment}" "${commentTo}"`).then(
            res => console.log(res)
        )
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
        }).then(resp => this.totalAmount = parseFloat(resp)
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
            console.log(key)
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