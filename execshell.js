const { exec } = require("child_process");
const util = require("util");
const execProm = util.promisify(exec);

async function executeShellCommand(command) {
   const smlycli = "smileycoin-cli";
   let result;
   let execcommand = `${smlycli} ${command}`
   console.log(execcommand)
   try {
     result = await execProm(execcommand);
   } catch(ex) {
      result = ex;
   }
   if ( Error[Symbol.hasInstance](result) )
       return ;

   return result;
}


module.exports = executeShellCommand