const { debug } = require('console');
const {writeFile, readFileSync, existsSync, exists  } = require('fs');

function writeObjToFile(filename,obj){
    writeFile(filename,JSON.stringify(obj),(err) => {
        if(err){
            throw err;
        }
        console.log(filename + " saved")
    })
}

function readObjFromFile(filename){
    if(!validatePath(filename)) return;
    let rawdata = readFileSync(filename);
    if(rawdata.length === 0){
        rawdata = JSON.parse(rawdata);
    }
    return rawdata;
}
function validatePath(path){
    try{
        if(existsSync(path))
            return true;
        return false;
    }catch(err){
        return false
    }
}

exports.writeObjToFile = writeObjToFile;
exports.readObjFromFile = readObjFromFile;
exports.validatePath = validatePath;