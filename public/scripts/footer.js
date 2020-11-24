document.addEventListener("DOMContentLoaded", () => {
    let ratesOut = document.querySelectorAll('.rate__out')
    fetch(`https://min-api.cryptocompare.com/data/price?fsym=SMLY&tsyms=ISK,BTC,DOGE,USD`).then(res=> {
        if(res.status !== 200){
            console.error("Failed Getting SMLY exchange Rate")
            return
        }
        return res.json();
    }).then(data => {
        let i = 0;
        for (const d in data) {
            ratesOut[i].textContent = `${data[d]} ${d}`
            i++;
        }
  
    })
});