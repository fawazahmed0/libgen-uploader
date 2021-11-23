const { firefox } = require('playwright');
const fs = require('fs')
const path = require('path')
const crypto = require('crypto');
const { pipeline } = require('stream/promises');
const user = 'genesis';
const pass = 'upload';
const url = 'https://libgen.rs'
const nonfictionurl = url + '/librarian'
const fictionurl = url + '/foreignfiction/librarian'
const uploadurl = 'https://library.bz/main/uploads/'

const captialize = words => words.split(' ').map( w =>  w.substring(0,1).toUpperCase()+ w.substring(1)).join(' ')

async function upload(books, options){
  const browser = await firefox.launch(options);
  const context = await browser.newContext({
    httpCredentials: {
      username: user,
      password: pass,
    },
  });
  const page = await context.newPage();
  let allLinks = []
for(let book of books){
    const { fiction = false } = book;
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
        console.error(e)
        let md5sum = await getMD5(book.path)
        allLinks.push({"sharelink":uploadurl+md5sum})
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

await page.click('text=submit')
let uploadText = 'An upload link to share'
await page.waitForSelector('text='+uploadText)
const sharelink = await page.locator('text='+uploadText).locator('a').getAttribute('href')
let linkobj = {"sharelink":sharelink}
    allLinks.push(linkobj)
    if(typeof book.onSuccess === 'function')
        book.onSuccess(linkobj)
}
 await browser.close();

 return allLinks;
 

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


module.exports.upload = upload;