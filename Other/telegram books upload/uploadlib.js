// Upload extracted pdf path and title with authorname
// It is in this format:
// file:///E:/telegram%20export/files/the-path-to-memorization.pdf||||The Path to Memorization
const fs = require('fs');
const path = require('path');
const { upload } = require('libgen-uploader');

async function test() {
    let pathToFile = path.join(__dirname, 'extracted1.txt');
    var orgarr = fs.readFileSync(pathToFile).toString().split(/\r?\n/)
    var filterarr = orgarr.filter(elem => !/^\s*$/.test(elem))
    let cleanarr = [...new Set(filterarr)]
    let booksArr = []
    for (let val of cleanarr) {
        let [pdfpath, titleWithAuthor] = val.split('||||')

        let fullpath = path.join('E:\\', 'telegram export', 'files', decodeURIComponent(pdfpath.split('/').pop().trim()))

        let [title, author] = titleWithAuthor.split(/\s+by\s+/i)
        author ??= '';

        // Save csv file
        const onUpload = (objLinks) => {
            let lolLink = 'http://library.lol/main/' + objLinks.sharelink.split('/').pop()
            fs.appendFileSync(path.join(__dirname, "books.csv"), `${title.replace(',', ' ')},${objLinks.sharelink},${lolLink},${objLinks.ipfslink}\n`);
        }

        const onError = (error, bookObj) => {
            console.log(bookObj);
        }
        booksArr.push({ path: fullpath, metadata: { "title": title.trim(), "author": author.trim(), "tags": "Islamic" }, onSuccess: onUpload, onError: onError });
        
    }
    await upload(booksArr, { headless: true })

}

test()