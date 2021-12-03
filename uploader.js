const { firefox } = require('playwright');
const puppeteer = require('puppeteer');
const IFPSHasher = require('ipfs-only-hash')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto');
const { pipeline } = require('stream/promises');
const fetch = require('node-fetch');
const user = 'genesis';
const pass = 'upload';
const url = 'https://libgen.rs'
const nonfictionurl = url + '/librarian'
const fictionurl = url + '/foreignfiction/librarian'
var uploadurl = 'https://library.bz/main/uploads/'
const checkurl = url + '/book/index.php?md5='
const cloudflareIPFSLink = 'https://cloudflare-ipfs.com/ipfs/'

const captialize = words => words.split(' ').map( w =>  w.substring(0,1).toUpperCase()+ w.substring(1)).join(' ')

const fetchWithFallback = async (links,obj) => {
  let response;
  for(let link of links)
  {  try{
      response = await fetch(link,obj)
      if(response.ok)
          return response
        }catch(e){}
  }
  return response;
}

let allLinks = []

async function upload(books, options){
  const browser = await firefox.launch(options);
  const context = await browser.newContext({
    httpCredentials: {
      username: user,
      password: pass,
    },
  });
  const page = await context.newPage();
  await page.goto(nonfictionurl,{timeout:70000});
  const puppeteerBrowser = await puppeteer.launch();
  const puppeteerPage = await puppeteerBrowser.newPage();
  await puppeteerPage.authenticate({'username':user, 'password': pass});

for(let book of books){
  try{
    const { fiction = false } = book;
    if(fiction)
      uploadurl = 'https://library.bz/fiction/uploads/'
    let bookData = book.stream ? book.path : fs.readFileSync(book.path);
    let md5sum = await getMD5(bookData, book.stream)
    let ipfsHash = await getIPFSHash(bookData, book.stream)


    let response = await fetchWithFallback([checkurl,uploadurl].map(e=>e+md5sum),{method:'GET', 
    headers: {'Authorization': 'Basic ' + btoa(user+':'+pass)}})
    if(response.ok){
      // skipping this book, as it already exists at libgen
      await saveData(book, md5sum, ipfsHash)
      continue
    }
    const gotoURL = fiction ? fictionurl : nonfictionurl;
  try{
    await puppeteerPage.goto(gotoURL,{
      waitUntil: 'networkidle0',
    });
  }catch(e){
      console.error(e)
      await puppeteerPage.goto(gotoURL.replace('.rs','.is'),{
        waitUntil: 'networkidle0',
      });
  }
  
    const inputUploadHandle = await puppeteerPage.$('input[type=file]');
    inputUploadHandle.uploadFile(book.path);

  // select options using
  // await page.selectOption('text="Choose a color"', 'blue');

  await puppeteerPage.click('input[type="submit"]')
  await puppeteerPage.waitForNetworkIdle({timeout:0})
  await page.goto(puppeteerPage.url())
  let content;
  try{
        content = await page.textContent(':text("Google Books ID"),:text("no file was uploaded ")');
      }catch(e){
        let body = await puppeteerPage.evaluate(()=>document.querySelector('body').textContent)
        console.log("Please Ignore this debug Message")
        console.log("Maybe the file "+book.path+" already exists in library genesis")
        console.log("\n"+body.trim().replace(/\s+/gi,' ')+"\n\n")
        await saveData(book, md5sum, ipfsHash)
        continue
  }

  if(content.toLowerCase().includes('no file was uploaded'))
    throw new Error('File size not supported due to playwright bug https://github.com/microsoft/playwright/issues/3768')
  // set language to english, if no language found
  if(Object.keys(book.metadata).filter(e => e.toLowerCase().startsWith('lang')).length == 0){
      try{await setLanguage(page, "english")}catch(e){console.error(e)}
  }
// Add all metadata into the text fields
  for(let [key, value] of Object.entries(book.metadata)){
      key = key.trim()
      value = value.trim()
      try{
        if(key.toLowerCase().startsWith('lang'))
           await setLanguage(page, value)
          else
            await page.fill("text="+key, value)
      }catch(e){
          console.error(e)
      }
  }

let uploadText = 'An upload link to share'

for(let j=0;j<3;j++){
try{
await page.click('input[type="submit"] >> nth=-1')
await page.waitForSelector('text='+uploadText,{timeout:10000})
break;
}catch(e){
  console.log('Trying to click submit button again')
  await page.waitForTimeout(2000)
}
}

await page.waitForSelector('text='+uploadText,{timeout:10000})

//const sharelink = await page.locator('text='+uploadText).locator('a').getAttribute('href')
await saveData(book, md5sum, ipfsHash)

  }catch(e){
    console.log("failed upload for ", book.path)
    console.error(e)
    if(typeof book.onError === 'function')
        book.onError(e,book)

  }

}
 await browser.close();
 await puppeteerBrowser.close();

 return allLinks;
 

}

async function saveData(book, md5sum, ipfsHash){
  const ipfslink = await generateIPFSLink(ipfsHash, book.path, Object.entries(book.metadata).filter(([key, val]) => key.toLowerCase().startsWith('title'))[0][1])
  let linkobj = {"sharelink":uploadurl+md5sum,"ipfslink":ipfslink}
    allLinks.push(linkobj)
    if(typeof book.onSuccess === 'function')
        book.onSuccess(linkobj)

}

async function setLanguage(page, value){
    await page.fill('input[name="language"]', captialize(value.toLowerCase()))
    await page.selectOption('select[name="language_options"]', captialize(value.toLowerCase()))
}

// file is either path or filecontent, use path when stream is true
async function getMD5(file, stream=false){
  const hash = crypto.createHash('md5');
  if(stream)
  await pipeline(
    fs.createReadStream(file),
    hash
  )
  else
     hash.update(file)
  return hash.digest('hex').toUpperCase();
  }

// file is either path or filecontent, use path when stream is true
async function getIPFSHash(file, stream=false){
  if(stream)
   file = fs.createReadStream(file)
  const hash = await IFPSHasher.of(file, {cidVersion:1,rawLeaves:true,hashAlg:'blake2b-256'})
  return hash
}

async function generateIPFSLink(hash, bookPath, title){
const filename = path.basename(bookPath);
const fileExt = filename.split('.').pop()
return  cloudflareIPFSLink + hash +'?filename='+encodeURIComponent(title+'.'+fileExt)
}

module.exports.upload = upload;