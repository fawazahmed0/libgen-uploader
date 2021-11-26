
// Extract pdfs & title from telegram exported message
// The export was done using official telegram desktop application

const { firefox } = require('playwright');
const fs = require('fs');
const path = require('path');

async function test(){
  const browser = await firefox.launch({ headless: true });
  const page = await browser.newPage();

  
for(let i=7;i<=10;i++){
    if(i!=1)
    await page.goto('file:///E:/telegram%20export/messages'+i+'.html');
    else
    await page.goto('file:///E:/telegram%20export/messages.html');

  let bigarr =  await page.evaluate(() => {
        let arr = []
        for(let elem of Array.from(document.querySelectorAll('[href$=".pdf"]'))){

            try{
              // If the pdf name is next to the pdf, use this
               // arr.push(elem.href+'||||'+elem.closest('[id^="message"]').nextElementSibling.querySelector('.text').textContent.trim())
               
               // If the pdf name is above the pdf, use this
                arr.push(elem.href+'||||'+elem.closest('[id^="message"]').previousElementSibling.querySelector('.text').textContent.trim())
            }catch(e){}
        }
     return arr;
    });
fs.appendFileSync(path.join(__dirname,'extracted3.txt'),bigarr.join('\n')+'\n');
  
}
await browser.close();
}
test()