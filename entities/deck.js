const Card = require('./card')

class Deck{
    constructor(deck){
        this.deck = []
        if(!deck)
            this.newDeck();
        else
            this.buildDeck(deck)
    }

    newDeck(){
        for(let i = 0; i < 4 ;i++){
            for(let j = 0; j < 13; j++){
                let card = new Card(i,j)
                this.deck.push(card)
            }
        }
    }
    buildDeck(deck){
        for(let c of deck){
            let card = new Card(c.suit,c.rank)
            this.deck.push(card)
        }
    }


    shuffleDeck(){
        let currentIndex = this.deck.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this.deck[currentIndex];
            this.deck[currentIndex] = this.deck[randomIndex];
            this.deck[randomIndex] = temporaryValue;
        }
    }
    getSize(){ return this.deck.length}
    drawCard(){
        return this.deck.pop();
    }


}

module.exports = Deck;