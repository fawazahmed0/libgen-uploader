const { firefox } = require('playwright');
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
  await page.goto(nonfictionurl);

for(let book of books){
  try{
    const { fiction = false } = book;
    if(fiction)
      uploadurl = 'https://library.bz/fiction/uploads/'

    let md5sum = await getMD5(book.path)
    let response = await fetchWithFallback([checkurl,uploadurl].map(e=>e+md5sum),{method:'GET', 
    headers: {'Authorization': 'Basic ' + btoa(user+':'+pass)}})
    if(response.ok){
      // skipping this book, as it already exists at libgen
      await saveData(book, md5sum)
      continue
    }
    const gotoURL = fiction ? fictionurl : nonfictionurl;
  try{
    await page.goto(gotoURL);
  }catch(e){
      console.error(e)
      await page.goto(gotoURL.replace('.rs','.is'));
  }

  await page.setInputFiles('input[type="file"]', book.path);
  // select options using
  // await page.selectOption('text="Choose a color"', 'blue');

   await page.click('input[type="submit"]',{noWaitAfter:true})
  await page.waitForNavigation({waitUntil: 'networkidle',timeout:0})
  try{
  await page.waitForSelector('text="Google Books ID"')
  }catch(e){
        await saveData(book, md5sum)
        continue
  }

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
await page.click('text=submit')
await page.waitForSelector('text='+uploadText,{timeout:10000})
break;
}catch(e){
  console.log('Trying to click submit button again')
}
}

await page.waitForSelector('text='+uploadText,{timeout:10000})

//const sharelink = await page.locator('text='+uploadText).locator('a').getAttribute('href')
await saveData(book, md5sum)

  }catch(e){
    console.log("failed upload for ", book.path)
    console.error(e)
    if(typeof book.onError === 'function')
        book.onError(e,book)

  }

}
 await browser.close();

 return allLinks;
 

}

async function saveData(book, md5sum){
  const ipfslink = await generateIPFSLink(book.path, Object.entries(book.metadata).filter(([key, val]) => key.toLowerCase().startsWith('title'))[0][1])
  let linkobj = {"sharelink":uploadurl+md5sum,"ipfslink":ipfslink}
    allLinks.push(linkobj)
    if(typeof book.onSuccess === 'function')
        book.onSuccess(linkobj)

}

async function setLanguage(page, value){
    await page.fill('input[name="language"]', captialize(value.toLowerCase()))
    await page.selectOption('select[name="language_options"]', captialize(value.toLowerCase()))
}

async function getMD5(filepath){
  const hash = crypto.createHash('md5');
  await pipeline(
    fs.createReadStream(filepath),
    hash
  );
  return hash.digest('hex').toUpperCase();
  }

async function generateIPFSLink(bookPath, title){
let stream = fs.createReadStream(bookPath)
const hash = await IFPSHasher.of(stream, {cidVersion:1,rawLeaves:true,hashAlg:'blake2b-256'})
const filename = path.basename(bookPath);
const fileExt = filename.split('.').pop()
return  cloudflareIPFSLink + hash +'?filename='+encodeURIComponent(title+'.'+fileExt)
}

module.exports.upload = upload;