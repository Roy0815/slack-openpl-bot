//This will be an App that allows Slack users to get Data from openpowerlifting.org directly into the workspace
// Test

const fs = require('fs'); 
const csv = require('csv-parser');

fs.createReadStream('openipf-2021.csv')
.pipe(csv())
.on('data', function(data){
    try {
        console.log(data)
        console.log("Name is: "+ data.Name);
        console.log("Sex is: "+ data.Sex);
    }
    catch(err) {
        //error handler
    }
})
.on('end',function(){
    //some final operation
});