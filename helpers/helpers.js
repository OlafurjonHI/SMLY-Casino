function el(tagname,classname,text){
    let element = document.createElement(tagname)
    if(classname)
        element.classList.add(classname)
    if(text)
        element.appendChild(document.createTextNode(text))
    return element;
}

exports.el = el;