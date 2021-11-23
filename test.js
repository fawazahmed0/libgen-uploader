// Note: metadataobject supports all input fields, for example author, edition, issn ,city etc
const {upload} = require('./uploader.js')

    let metadata1 = {"title":"The Soul's Journey After Death","language":"english","isbn":"978-1643541365"}
    let book1 = {path:'en_the_soul_journey.pdf',metadata:metadata1}
    // Supports all input fields isbn etc
    let metadata2 = {"title":"Diseases Of The Hearts And TheirCures.pdf","language":"english" ,"isbn":"978-1898649304"}
    let book2 = {path:'en_Diseases_Of_The_Hearts_And_Their_Cures.pdf',metadata:metadata2, fiction:false, onSuccess: (obj) => console.log(obj)}
   upload([book1,book2],{headless:false}).then(console.log)
