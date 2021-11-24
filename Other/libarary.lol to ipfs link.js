// Take library.lol links from links.txt and converts into ipfs links, by visiting each link and scrapping the ipfs link
// Currently this program is not required as ipfs hash can be calculated logically
const fs = require('fs');
const { firefox } = require('playwright');

async function test(){
  const browser = await firefox.launch();
let alllinks = []
  const page = await browser.newPage();
  // contains library.lol links
  let arr = fs.readFileSync('links.txt').toString().split('\n')
  var filterarr = arr.filter(elem => !/^\s*$/.test(elem))
  for(let link of filterarr){
  await page.goto(link)
  let cloudflareipfs = await page.evaluate(() => document.querySelector('a[href*="cloudflare-ipfs"]')?.href);
  alllinks.push(link+','+cloudflareipfs)

  }
fs.writeFileSync('ipfslinks.txt', alllinks.join('\n'))
  await browser.close();

}
test()