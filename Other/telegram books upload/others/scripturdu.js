const fs  = require('fs')
const path = require('path')
const captialize = words => words.split(' ').map( w =>  w.substring(0,1).toUpperCase()+ w.substring(1)).join(' ')
let filesPath = path.join(__dirname, 'files')
let files = fs.readdirSync('files').filter(file => file.endsWith('.pdf'))
let arr= [];
for(let file of files){
    let language = 'Urdu'


       let title = file.replace('.pdf', '').replace(/_/gi, ' ')
       title = captialize(title.toLowerCase())
       

       let filePath = path.join(filesPath, file)
       let metadata = {"language": language, "title": title}

         arr.push({"path": filePath,metadata: metadata})
}

fs.writeFileSync('files.json', JSON.stringify(arr))