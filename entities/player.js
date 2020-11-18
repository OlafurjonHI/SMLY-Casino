const fetch = require('node-fetch');
class Player {
    constructor(username,password,orgAddress,casinoAddress,currentFunds,currentWinnings){
        this.username = username;
        this.password = password,
        this.orgAddress = orgAddress;
        this.casinoaddress = (casinoAddress) ? casinoAddress : "";
        this.currentFunds = currentFunds
        this.currentWinnings = currentWinnings;
    }
    getUserName(){
        return this.username;
    }
    setCurrentFunds(funds) {
        this.currentFunds = funds
    }
    updatePlayerBalance(server){
        let url = `${server}getbalance?account=${this.username}`
        console.log(url)
        fetch(url).then(res => {
            if(res.status !== 200) console.error("Failed")
            return res.json();
        }).then(resp => {
            this.currentFunds = parseFloat(resp)
            console.log(resp)
            console.log(this)
        }).catch(error =>console.log("error getting funds" + error))  
    }

}

module.exports = Player;