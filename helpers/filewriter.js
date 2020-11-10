const {writeFile, readFileSync  } = require('fs');

function writeObjToFile(filename,obj){
    writeFile(filename,JSON.stringify(obj),(err) => {
        if(err){
            throw err;
        }
        console.log(filename + " saved")
    })
}

function readObjFromFile(filename){
    let rawdata = readFileSync(filename);
    let data = JSON.parse(rawdata);
    console.log(data)
    return data;
}

exports.writeObjToFile = writeObjToFile;
exports.readObjFromTile = readObjFromFile;