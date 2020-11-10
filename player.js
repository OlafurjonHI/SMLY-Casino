class Player {
    constructor(username,password,orgAddress){
        this.username = username;
        this.password = password,
        this.orgAddress = orgAddress;
        this.casinoaddress = ""
        this.currentFunds = 0;
    }
    getUserName(){
        return this.username;
    }

}

module.exports = Player;