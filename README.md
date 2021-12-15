<h1 align="center">Libgen Books Uploader</h1>

<p align="center">
  <img width="460" height="300" src="https://github.com/fawazahmed0/libgen-uploader/raw/main/books.jpg">
  
[![npm version](https://img.shields.io/npm/v/libgen-uploader.svg?style=flat)](https://www.npmjs.com/package/libgen-uploader)
  
**In the name of God, who have guided me to do this work**
  
Please star this repo by clicking on [:star: button](#) above [:arrow_upper_right:](#)


### Features:
- Batch upload
- Easy to use

### Prerequisite:
- Install [Nodejs](https://nodejs.org/en/)
  
### Installation:
```js
npm i libgen-uploader
```


### Usage:
- #### Uploading Books:  

```js

const { upload } = require('libgen-uploader');

let metadata1 = {"title":"Title 1"}
let book1 = {path:'book1.pdf',metadata:metadata1}
// Supports all input fields isbn, author, edition, issn ,city etc
let metadata2 = {"title":"Title 2","language":"english" ,"isbn":"978-1898649304"}
let book2 = {path:'book2.pdf',metadata:metadata2, fiction:false, onSuccess: (obj) => console.log(obj), onError: (err,bookObj) => console.log(bookObj), stream: false}

upload([book1,book2]).then(console.log)

// OR
// This package uses playwright, you can also pass playwright launch configuration
upload([book1,book2], {headless:false}).then(console.log)


// Refer Playwright documentation for more launch configurations like proxy etc
// https://playwright.dev/docs/api/class-browsertype#browser-type-launch
```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Output:**
```js
[
  {
    sharelink: 'https://library.bz/main/uploads/B444BF2C1BA48F5F9BA76C4A9E2C6DD6',
    ipfslink: 'https://cloudflare-ipfs.com/ipfs/QmQqfvUeZngRFFmEA6PayKVZQsgcqFxj35t6zvEmFWiu4V?filename=title.pdf'
  },
  {
    sharelink: 'https://library.bz/main/uploads/B7CCFF6A3313AE14181665B9148195A4',
    ipfslink: 'https://cloudflare-ipfs.com/ipfs/QmeVbw2KJwYtT9RZNnBru4Xw89N9ptFVkK5kZH5SEkdRwM?filename=title.pdf'
  }
]
```
**Note 1:** This package supports all text fields, just give the field label in the metadata object and it will input text near that field, for example if you want to enter DOI, you add this in metadata object `'doi':'doi value'` , or open library id `'open library':'open library id value'` and so on.<br><br>
**Note 2:** Dropdowns like Topic etc are not supported yet, Only text fields for now <br><br>
**Note 3:** IPFS Link will start working after 4-5 days <br><br>
**Manual Guide for Noobs:** [Link](https://github.com/fawazahmed0/sharebook/)

<br>
<br>
  
[:pencil2:*Improve this page*](https://github.com/fawazahmed0/libgen-uploader/edit/main/README.md)
