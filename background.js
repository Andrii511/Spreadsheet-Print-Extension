var data = {}

function getToken(token) {
  data.token = token
  console.log('this is the token: ', token);
}

function query() {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    try {
      data.capturedId = url.match(/\/d\/(.+)\//)[1] || null
      console.log('Fetching token');
      chrome.identity.getAuthToken({
         interactive: true 
      }, function(token){
        if(data.token == undefined) {
          getToken(token)
        }
      });
    } catch (e) {

    }
    // if (data.capturedId && location.host == 'docs.google.com') {
    // }  
  });
}

chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
  console.log('Tab updated');
  query()
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'get_data') {
    console.log('Data Request listened', data);
    sendResponse(data);
    return true;
  } else if(request.message === 'token_change') {
    chrome.identity.getAuthToken({
      interactive: true 
   }, function(token){
       getToken(token)
        sendResponse(data);
   }); 
  }
});