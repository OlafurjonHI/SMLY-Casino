document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  
  
    function fetchData() {
        fetch(`${window.location.origin}/gethelp`)
        .then((res) => {
            if (res.status != 200) console.error("Failed To fetch data");
            return res.json();
        })
        .then((data) => populateData(data));
    }

    function populateData(data){
        let body = document.querySelector('body');
        body.style = "display:flex;flex-direction:column;"
        data.forEach(d => {
            let span = document.createElement('span')
            span.appendChild(document.createTextNode(`${d}`))
            body.appendChild(span)
        });
    }

  
});
