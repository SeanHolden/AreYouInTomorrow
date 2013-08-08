// Helper functions to help keep server.js clean

function processResponse(body, from, response, callback){
  if( body.trim()[0] == '1' ){
    console.log('Yep, %s will be in tomorrow', from);
  }else if(body.trim()[0] == '2' ){
    console.log('Nope, %s will not be in tomorrow', from);
  }else if(body.trim()[0] == '3' ){
    console.log('Maybe %s will be in tomorrow', from);
  }else{
    console.log('Unrecognised response. Not 1, 2 or 3.');
  };
  callback(response);
}

module.exports = { 
  processResponse : processResponse 
};
