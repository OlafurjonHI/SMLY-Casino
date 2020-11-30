const Deck = require('./deck');
const Card = require('./card');

class Blackjack {
    constructor(deck,dealer,player) {
        this.deck = []
        this.dealer = dealer;
        this.player = player
        if(!deck)
            this.deck = new Deck();
        else
            this.deck = new Deck(deck);
    }

    dealCards(){
        for(let i = 0; i < 2; i++){
            this.dealerhand.push(this.deck.drawCard())
            this.player.push(this.deck.drawCard())
        }
    }

    getPlayerHand(){
        return this.player;
    }
    getDealerHand(){
        return this.dealer;
    }

    hitCard(hand){
        hand.push(this.deck(drawCard))
    }

    getHandTotal(hand){
        let total = 0;
        let ace = 0
        for(let h of hand){
            let rank = h.getPureRank()+1
            if(rank === 1){
                ace++;
            }
            else if(rank > 10){
                total +=10;
            }
            else {
                total +=rank
            }
        }
     switch(ace){
         case 1: total += (total + 11 <= 21) ? 11 : 1;
            break;
        case 2: total += (total + 12 <= 21) ? 12 : 2;
            break;
        case 3: total += (total + 13 <= 21) ? 13 : 3;
            break;
        case 4: total += (total + 14 <= 21) ? 14 : 4;
            break;
     }
        return parseInt(total);
    }

    checkWin(){
        let playerWon = undefined;
        let playerTotal =this.getHandTotal(this.player)
        let dealerTotal = this.getHandTotal(this.dealer)
        if(playerTotal > 21){
            console.log("Player Bust")
            playerWon = false;
        }
        else if(dealerTotal > 21){
            console.log("Dealer Bust!")
            playerWon =  true;
        }
        else if(dealerTotal > playerTotal){
            console.log("Dealer Won")
            playerWon = false;
        }
        else if(dealerTotal >= 17 && dealerTotal < playerTotal){
            playerWon = true;
        }
        return playerWon;
    }

}

module.exports = Blackjack