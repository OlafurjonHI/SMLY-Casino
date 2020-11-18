class Card {
    constructor(suit,rank){
        this.suit = suit;
        this.rank = rank;
        this.backimage = `/img/cards/spilbak.png`
    }

    getSuit(suit){
        suit = parseInt(suit)
        suit = (suit < 2) ? (suit === 1) ? "Spades" : "Hearts" : (suit === 2) ? "Diamonds" : "Clubs"
        return suit;
    }


    getRank(rank){
        rank = parseInt(rank)
        if(rank === 0)
            return "Ace"
        if(rank <= 9)
            return rank+1
        rank = (rank < 12) ? (rank === 10) ? "Jack" : "Queen" : "King"
        return rank
    }
    getImgPath(){
        let suit = parseInt(this.suit)
        let imgdir = (suit < 2) ? (suit === 1) ? "spadi" : "hjarta" : (suit === 2) ? "tigull" : "lauf"
        return `/img/cards/${imgdir}/${this.rank+1}.png`
    }

    toString(){
        return `${this.getRank(this.rank)} of ${this.getSuit(this.suit)}`
    }
}

module.exports = Card;