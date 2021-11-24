// Read books named folder recursively and upload them to library genesis, it uses pdf name as title
// It will save the links in books.csv file
const read = require("fs-readdir-recursive");
const path = require("path");
const fs = require("fs");
const { upload } = require('libgen-uploader');

// Read books folder
const booksDir = path.join(__dirname, "books");
const foundFiles = read(booksDir)

async function uploadBooks(){
    let booksArr = []
    for(let book of foundFiles){
        const bookPath = path.join(booksDir, book);
        const filename = path.basename(bookPath)
        const title = filename.replace(/\..*?$/,"")

        // Save csv file
        const onUpload = (objLinks) => {
            let lolLink = 'http://library.lol/main/'+objLinks.sharelink.split('/').pop()
            fs.appendFileSync(path.join(__dirname, "books.csv").replace(',',' '), `${bookPath},${objLinks.sharelink},${lolLink},${objLinks.ipfslink}\n`);
        }
        booksArr.push({path: bookPath, metadata:{"title": title}, onSuccess: onUpload})
    }
    await upload(booksArr, {headless:true})
}



uploadBooks()