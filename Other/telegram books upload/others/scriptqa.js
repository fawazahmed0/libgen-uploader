const fs  = require('fs')
const path = require('path')

let filesPath = path.join(__dirname, 'files')
let files = fs.readdirSync('files').filter(file => file.endsWith('.pdf'))
let arr= [];
for(let file of files){
    let language = 'Arabic'


       let title = file.replace('.pdf', '').replace(/_/gi, ' ')
       

       let filePath = path.join(filesPath, file)
       let metadata = {"language": language, "title": title}

         arr.push({"path": filePath,metadata: metadata})
}

fs.writeFileSync('files.json', JSON.stringify(arr))