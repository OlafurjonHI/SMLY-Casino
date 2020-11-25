document.addEventListener("DOMContentLoaded", ()=> {
    let casAddress = document.querySelector('.SMLY__address');
    let address = casAddress.textContent.split(':')[1].trim();
    let sectionqr = document.querySelector('.section__qr')
    new QRCode(sectionqr,address)
});