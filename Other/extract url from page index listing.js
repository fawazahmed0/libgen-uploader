
// Extract url from page index listing recursively from all directories
const fs = require('fs');
const { firefox } = require('playwright');
var alllinks = []
async function test(){
  const browser = await firefox.launch({headless: false});

  const page = await browser.newPage();
  await page.goto('http://pub.agrarix.net/Windows/');
  const hrefs = await getHrefs(page)

  await hrefsGoer(page, hrefs)
fs.writeFileSync('links.txt', alllinks.join('\n'))
  

}

async function hrefsGoer(page, hrefs){

    for(let href of hrefs){
        if(href.endsWith('/')){
            await page.goto(href)
            let allhrefs = await getHrefs(page)
      await hrefsGoer(page, allhrefs)
    }else{
        console.log(href)
      alllinks.push(href)
    }
  }

}

async function getHrefs(page){
return await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(e=>e.href).slice(1));
}


test()