const FW = require('./helpers/filewriter');

class Casino {
    constructor(){
        this.account = "SMLYCASINO"
        this.address = "BPYKcpotu8KgHMSYmrjT9ZzjMXhiY6CDjR"
        this.totalAmount = 0;
        this.playerFile = "files/players.json";
        this.players = {playerlist:[]}
        
        this.initPlayerFile();
    }

    getCasinoBalance(shellcommand){
        shellcommand(`getbalance ${this.account}`).then(
            res => console.log(res.stdout)
        )
    }

    tranferFromCasino(shellcommand,to,amount,comment,commentTo){
        shellcommand(`sendfrom "${this.account}" "${to}" ${amount} 6 "${comment}" "${commentTo}"`).then(
            res => console.log(res)
        )
    }

    getNewAddressforPlayer(shellcommand,player){
        shellcommand(`getnewaddress ${player.username}`).then(res => {
            player.casinoaddress = (res.stdout).trim()
            this.addPlayer(player)
            FW.writeObjToFile(this.playerFile,this.players)          
        })
    }

    addPlayer(player){
        this.players.playerlist.push(player)
    }
    showPlayers(){
        console.log(this.players)
    }
    getPlayerBalance(shellcommand,player){
        shellcommand(`getbalance ${player.username}`).then(
            res => console.log(res.stdout)
        )
    }
    getPlayersList(){
        return this.playerFile;
    }

    initPlayerFile(){
        console.log(this.playerFile);
        let playerlist = FW.readObjFromTile(this.playerFile).playerlist;
        if(!playerlist || playerlist.length === 0)
            return
        playerlist.forEach(p=> this.players.playerlist.push(p))
    }

    verifyPlayer(username,password){
        if(this.players.playerlist.length === 0)
            return null;
        console.log("list: " + this.players.playerlist)
        let filtered = this.players.playerlist.filter(p => p.username.toLowerCase() === username.toLowerCase())
        if(filtered.length === 0)
            return null;
        console.log("player:" + filtered[0])
        if(filtered[0].password === password)
            return filtered[0]
    }
}

module.exports = Casino;