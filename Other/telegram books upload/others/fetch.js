const fs  = require('fs')
const path = require('path')
let telegramPath = path.join(__dirname, 'telegram')
let folders = fs.readdirSync(telegramPath)
let arr = []
for(let folder of folders) {
 try{
let jsonObj = fs.readFileSync(path.join(telegramPath,folder, 'files.json'))
let json = JSON.parse(jsonObj)
arr = arr.concat(json)



 }  catch(err) {
   console.log(err)
 }


}

fs.writeFileSync('bigfiles.json', JSON.stringify(arr))