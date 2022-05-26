var background = {}; //do this in global scope for popup.js
var link = null
var input = null
var output = null

var outputLayout = `
<div class="info" id="info"  style="width:500px; padding-left:100px; padding-right:100px;">
    <p class="head" style="font-size: 25px;">Auction</p>
    <p class="auction-id" style="font-size: 50px;">#AUCTION_ID</p>

    <p class="mt-10" style="font-size: 25px;">End Date And Time</p>
    <div class="schedule-cont space-between">
        <p style="font-size: 25px;font-weight: 600;">#END_DATE</p>
        <p style="font-size: 25px;font-weight: 600;">#END_TIME</p>
    </div>
    
    <p class="mt-10" style="font-size: 25px;font-weight: 600;">Item Numbers</p>
    <div class="item-cont space-between">
        <p style="font-size: 25px;font-weight: 600;">#ITEM_ID_1</p>
        <p style="font-size: 25px;font-weight: 600;">#ITEM_ID_2</p>
    </div>

    <div class="relot-cont space-between">
        <div class="relot-date">
        <p style="font-size: 40px;text-align:left;">Relot After</p>
            <p style="font-size: 40px;">#RELOAT_DATE</p>
        </div>
        <div class="swh-cont">
            <p style="font-size: 30px;font-weight: 600;">#SWH</p>
        </div>
    </div>
</div>
<div id="img-out"></div>
`

function outputlayoutinit() {outputLayout = `
<div class="info" id="info"  style="width:500px; padding-left:100px; padding-right:100px;">
    <p class="head" style="font-size: 25px;">Auction</p>
    <p class="auction-id" style="font-size: 50px;">#AUCTION_ID</p>

    <p class="mt-10" style="font-size: 25px;">End Date And Time</p>
    <div class="schedule-cont space-between">
        <p style="font-size: 25px;font-weight: 600;">#END_DATE</p>
        <p style="font-size: 25px;font-weight: 600;">#END_TIME</p>
    </div>
    
    <p class="mt-10" style="font-size: 25px;font-weight: 600;">Item Numbers</p>
    <div class="item-cont space-between">
        <p style="font-size: 25px;font-weight: 600;">#ITEM_ID_1</p>
        <p style="font-size: 25px;font-weight: 600;">#ITEM_ID_2</p>
    </div>

    <div class="relot-cont space-between">
        <div class="relot-date">
            <p style="font-size: 40px;text-align:left;">Relot After</p>
            <p style="font-size: 40px;">#RELOAT_DATE</p>
        </div>
        <div class="swh-cont">
            <p style="font-size: 30px;font-weight: 600;">#SWH</p>
        </div>
    </div>
</div>
<div id="img-out"></div>
`
}

document.addEventListener('DOMContentLoaded', function() {
    link = document.getElementById('clickMe');
    input = document.getElementById('rowNo');
    output = document.getElementById('op');

    link.addEventListener('click', function() {
        console.log('get_data calling');
        output.innerHTML = 'Fetching...'

        chrome.runtime.sendMessage({ 
            message: "get_data"
        }, response => {
            background = response
            console.log('Recieved data', background);
            outputlayoutinit()
            action();
        });
    });
});

function action() {
    console.log('action');
    let init = {
        method: 'GET',
        async: true,
        headers: {
          Authorization: 'Bearer ' +  background.token,
          'Content-Type': 'application/json'
        },
        'contentType': 'json'
    };
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${background.capturedId}/values/Auction Summary!${input.value}:${input.value}`,
        init)
        .then((response) => {
            return response.json()
        })
        .then(function(data) {
            console.log(data)
            if (data.type != 'undefined'  && data.hasOwnProperty('error')) {
                chrome.runtime.sendMessage({ 
                    message: "token_change"
                }, response => {
                    background = response
                    console.log('Recieved data', background);
                    outputlayoutinit()
                    action();
                });
            }
            printData(data)
        });
}

function printData(d) {
    if(d.values == undefined) {
        output.innerHTML = "This row doesn't have value."
        return
    }
    values = d.values[0]
    var mapObj = {
        '#AUCTION_ID': values[0],
        '#END_DATE': new Date(values[7]).toDateString(),
        '#END_TIME': values[8],
        '#ITEM_ID_1': values[5],
        '#ITEM_ID_2': values[6],
        '#RELOAT_DATE': new Date(values[4]).toDateString(),
        '#SWH': values[3]
    };
    outputLayout = outputLayout.replace(/#AUCTION_ID|#END_DATE|#END_TIME|#ITEM_ID_1|#ITEM_ID_2|#RELOAT_DATE|#SWH/gi, function(matched){
        return mapObj[matched];
    });
    output.innerHTML = outputLayout
    output.prepend(`Row ${input.value} Saved!!`)
    html2canvas(document.querySelector("#info"), ).then(canvas => {
        var a = document.createElement('a');

        a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
        a.download = `row${input.value}.jpg`;
        a.click()
    });
}