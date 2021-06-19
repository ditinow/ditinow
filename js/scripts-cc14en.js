var epochBeginning=1560945600;

function reloadClearFn(){
  sessionStorage.clear();
  location.reload();
  return false;
};

//toggle password visibility ===================================================
function togglePasswordFn(selector) {
  var x = document.getElementById(selector);
  var icon = "#"+selector+"Icon";
  if (x.type === "password") {
    x.type = "text";
    $(icon).html("&#128586");
  } else {
    x.type = "password";
    $(icon).html("&#128584");
  }
};

// timestamp to local time
  function timestampToLocalFn(timestamp){
    // var testnetEpochBeginning=1514275199;
    // var mainnetEpochBeginning=1514764800;
    var d =new Date();
    var offsetInSecond=60*d.getTimezoneOffset();
    // if(isNet=="mainnet"){
    var timestampToEpoch = timestamp + epochBeginning;
    // }else{
    //   var timestampToEpoch = timestamp + testnetEpochBeginning+offsetInSecond;
    // };
    var dateTime = new Date(timestampToEpoch * 1000);
    var daysPassed = Math.floor((d.getTime()-dateTime)/(1000*60*60*24));
    var year = dateTime.getFullYear();
    var month =leadingZero(1+ dateTime.getMonth(),2);
    var date = leadingZero(dateTime.getDate(),2);
    var hours = leadingZero(dateTime.getHours(),2);
    var minutes = leadingZero(dateTime.getMinutes(),2);
    var seconds = leadingZero(dateTime.getSeconds(),2);
    var displayDate = year+"-"+month+"-"+date;
    var displayTime = hours+ ":"+minutes+ ":"+seconds;
    var localDateTime = [displayDate,displayTime,daysPassed];
    return localDateTime;
  };
function leadingZero(num,places){
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
};


// Create QR Code ==============================================================
function qrCodeFn(text){
  var logosrc="images/logo-cc14-qr.png";
  var textStr=text.replace(/[\n\r\t]/g,"");
  var length=textStr.length;
  var cLevel;
  var config = {
    width: 240,
    height: 240,
    text:textStr,
    PI:"#0C8918",
    quietZone: 25,
    logo:logosrc,
    logoWidth:100,
    logoHeight:50,
    titleHeight:50,
    titleTop:20,
    correctLevel: QRCode.CorrectLevel.H
    };
  if (length>=40 && length<=80){
      console.log("1");
      config.width=240;
      config.height=240;
      config.correctLevel=3;
    }else if (length> 80 && length<=120) {
      console.log("2");
      config.width=280;
      config.height=280;
      config.correctLevel=0;
    }else if(length >120){
      console.log("3");
      config.width=320;
      config.height=320;
      config.correctLevel=1;
    };
  document.getElementById("dispQRCode").innerHTML="";
  var t=new QRCode(document.getElementById("dispQRCode"), config);
};

// broadcastTransactionFn ======================================================
function broadcastTransactionFn(selector){
  event.preventDefault();
  var formData = $("#"+selector+"BroadcastTransactionForm").serializeArray();
  console.log(formData);
  var ajaxData = [
    {name:"requestType",value:"broadcastTransaction"},
    {name:"transactionBytes",value: formData[0].value},
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:ajaxData,
    success:function(response){
      var responseObj=JSON.parse(response);
      if(responseObj.errorCode == "4"){
        console.log(responseObj.errorCode);
        $("#"+selector+"BroadcastTransactionResult").html("Broadcast failed. Please review your transactionBytes");
      }else{
        $("#"+selector+"BroadcastTransactionResult").html("Broadcast succeed. fullHash:<br>"+responseObj.fullHash);
      };
      $("#"+selector+"JSON").after("<h6>broadcastTransaction</h6><textarea class='form-control border border-info' rows='6'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
  $("#sentMessageResponse").removeClass("d-none");
};

//New Ardor Wallet =============================================================
$("#newWalletForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  var getAccountId = [
    {name:"requestType",value:"getAccountId"},
    {name:"secretPhrase",value:formData[0].value},
  ];
  console.log(url);
  console.log(localStorage.getItem("apiUrl"));
  $.ajax({
    type:"POST",
    url: url,
    data:getAccountId,
    success:function(response){
      var responseObj=JSON.parse(response);
      $("#newWalletResultTbl1").html(responseObj.accountRS);
      $("#newCC14Wallet").val(responseObj.accountRS);
      $("#newCC14WalletPubKey").val(responseObj.publicKey);
      $("#newWalletResultTbl2").html(responseObj.publicKey);
      $("#newWalletResultTbl3").html(formData[0].value);
      $("#newWalletJSON").append("<h6>getAccountId</h6><textarea class='form-control border border-info' rows='7'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      var accountRSConfig={
        width: 300,
        height: 300,
        text:responseObj.accountRS,
        PI:"#0C8918",
        quietZone: 25,
        logo:"images/logo-cc14-qr.png",
        logoWidth:100,
        logoHeight:50,
        title:"accountRS",
        titleHeight:30,
        titleTop:10,
        correctLevel: QRCode.CorrectLevel.H
      };
      var passphraseConfig={
        width: 300,
        height: 300,
        text:formData[0].value,
        PI:"#177CB0",
        quietZone: 25,
        logo:"images/logo-cc14-qr.png",
        logoWidth:100,
        logoHeight:50,
        title:"Passphrase",
        titleHeight:30,
        titleTop:10,
        correctLevel: QRCode.CorrectLevel.Q
      };
      var t=new QRCode(document.getElementById("newWalletQRCode"), accountRSConfig);
      var t=new QRCode(document.getElementById("newWalletQRCode"), passphraseConfig);
    }
  });
  $("#newWalletResponse").removeClass("d-none");
});

//Account Balance =============================================================
$("#getAccountBalancesForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  console.log(formData);
  var getAccountAssets = [
    {name:"requestType",value:"getAccountAssets"},
    {name:"includeAssetInfo",value:"true"},
    {name:"account",value: formData[0].value.trim()}
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:getAccountAssets,
    success:function(response){
      var responseObj=JSON.parse(response);
      console.log(responseObj);
      var length = responseObj.accountAssets.length;
        for(i=0; i<length; i++){
          var name = responseObj.accountAssets[i].name;
          var asset = responseObj.accountAssets[i].asset;
          var decimals = responseObj.accountAssets[i].decimals;
          var quantity = responseObj.accountAssets[i].quantityQNT/Math.pow(10,decimals);
          var qty = quantity.toFixed(decimals);
          var barcode     = parseInt(name, 32).toString(10);
          var tableRow = "<tr><td>"+i+
                         "</td><td>"+name+
                         "</td><td>"+barcode+
                         "</td><td>"+asset+
                         "</td><td>"+qty+
                         "</td><td>"+decimals+
                         "</td></tr>";
          $("#getAccountAssetsResultTbl tbody").append(tableRow);
        };
        $("#getAccountBalancesJSON").append("<h6>getAccountAssets</h6><textarea class='form-control border border-info' rows='12'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
  var getBalances = [
    {name:"requestType",value:"getBalance"},
    // {name:"chain",value:"1"},
    // {name:"chain",value:"2"},
    {name:"account",value: formData[0].value.trim()}
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:getBalances,
    success:function(response){
      var responseObj=JSON.parse(response);
      console.log(responseObj);
        $("#getAccountBalancesResult").html("<b>CC14:</b> " + responseObj.balanceNQT/100000000 + " . ");
        $("#getAccountBalancesJSON").append("<h6>getAccountBalances</h6><textarea class='form-control border border-info' rows='6'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      }
  });
    $("#getAccountBalancesResponse").removeClass("d-none");
});

// Assets By Issuer ============================================================
$("#getAssetsByIssuerForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  var getAssetsByIssuer = [
    {name:"requestType",value:"getAssetsByIssuer"},
    {name:"includeCounts",value:"true"},
    {name:"account",value: formData[0].value.trim()}
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:getAssetsByIssuer,
    success:function(response){
      var responseObj=JSON.parse(response);
      var newArrayObj=responseObj.assets[0];
      var length = newArrayObj.length;
      for(i=0; i<length; i++){
        var name = newArrayObj[i].name;
        var asset = newArrayObj[i].asset;
        var decimals = newArrayObj[i].decimals;
        var quantity = newArrayObj[i].quantityQNT/Math.pow(10,decimals);
        var qty = quantity.toFixed(decimals);
        var description = newArrayObj[i].description;
        var distribution = newArrayObj[i].numberOfAccounts;
        var transfers = newArrayObj[i].numberOfTransfers;
        var barcode     = parseInt(name, 32).toString(10);
        var phasing = newArrayObj[i].hasPhasingAssetControl;
        var tableRow = "<tr><td>"+i+
                       "</td><td>"+name+
                       "</td><td>"+barcode+
                       "</td><td>"+asset+
                       "</td><td>"+qty+
                       "</td><td>"+decimals+
                       "</td><td>"+description+
                       "</td><td>"+distribution+
                       "</td><td>"+transfers+
                       "</td><td>"+phasing+"</td></tr>";
        $("#getAssetsByIssuerResultTbl tbody").append(tableRow);
      };
      $("#getAssetsByIssuerJSON").after("<h6>getAssetsByIssuer</h6><textarea class='form-control border border-info' rows='12'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
  $("#getAssetsByIssuerResponse").removeClass("d-none");
});

//getAssetTransfers ============================================================
$("#getAssetTransfersForm").submit(function(event){
  event.preventDefault();
  var formData= $(this).serializeArray();
  var getAssetTransfers = [
    {name:"requestType",value:"getAssetTransfers"},
    {name:"includeAssetInfo",value:"true"},
    {name:"asset",value: formData[0].value.trim()},
    {name:"account",value: formData[1].value.trim()}
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:getAssetTransfers,
    success:function(response){
      var responseObj=JSON.parse(response);
      var length = responseObj.transfers.length;
      for (i=0; i<length; i++){
        var decimals = responseObj.transfers[i].decimals;
        var quantity = responseObj.transfers[i].quantityQNT/Math.pow(10,decimals);
        var qty = quantity.toFixed(decimals);
        var senderRS = responseObj.transfers[i].senderRS;
        var recipientRS = responseObj.transfers[i].recipientRS;
        var name = responseObj.transfers[i].name;
        var timestamp = responseObj.transfers[i].timestamp;
        var fullHash = responseObj.transfers[i].assetTransferFullHash;
        var transactionTime=timestampToLocalFn(timestamp);
        var tableRow = "<tr><td>"+i+
                      "</td><td>"+name+
                      "</td><td>"+qty+
                      "</td><td>"+transactionTime[0]+" "+transactionTime[1]+
                      "</td><td>"+senderRS+
                      "</td><td>"+recipientRS+
                      "</td><td>"+fullHash+
                      "</td></tr>";
        $("#historyResultTbl tbody").append(tableRow);
      };
      $("#historyJSON").after("<h6>getAssetTransfers</h6><textarea class='form-control border border-info' rows='12'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
  $("#historyTransfersActionResponse").removeClass("d-none");
});

//getTransaction ===============================================================
$("#historyTransactionForm").submit(function(event){
  event.preventDefault();
  var formData= $(this).serializeArray();
  var getAssetTransfers = [
    {name:"requestType",value:"getTransaction"},
    // {name:"chain",value:"2"},
    {name:"fullHash",value: formData[0].value},
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:getAssetTransfers,
    success:function(response){
      var responseObj=JSON.parse(response);
      $("#getTransactionResult").html("Please find transaction detail in JSON response section.");
      $("#historyJSON").after("<h6>getTransaction</h6><textarea class='form-control border border-info' rows='12'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
});

// sent message ================================================================
$("#sendMessageForm").submit(function(event){
  event.preventDefault();
  var formData= $(this).serializeArray();
  var sendMessage = [
    {name:"requestType",value:"sendMessage"},
    // {name:"chain",value:"2"},
    {name:"broadcast", value:"false"},
    {name:"feeNQT", value:"0"},
    {name:"deadline", value:"60"},
    // {name:"feeRateNQTPerFXT", value:"-1"},
    {name:"message",value: formData[0].value},
    {name:"recipient",value: formData[1].value},
    {name:"secretPhrase",value: formData[2].value}
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:sendMessage,
    success:function(response){
      var responseObj=JSON.parse(response);
      var sendTime = timestampToLocalFn(responseObj.transactionJSON.timestamp);
      var feeCC14=responseObj.transactionJSON.feeNQT/100000000;
      var senderRS = responseObj.transactionJSON.senderRS;
      var recipientRS = responseObj.transactionJSON.recipientRS;
      var message = responseObj.transactionJSON.attachment.message;
      var fullHash = responseObj.fullHash;
      $("#sendMessageTbl-senderRS").html(senderRS);
      $("#sendMessageTbl-recipientRS").html(recipientRS);
      $("#sendMessageTbl-message").html(message);
      $("#sendMessageTbl-fee").html(feeCC14+"&nbsp;CC14");
      $("#sendMessageTbl-sendTime").html(sendTime);
      $("#sendMessageTbl-fullHash").html(fullHash);
      $("#broadcastTransactionInput").val(responseObj.transactionBytes);
      $("#sendMessageJSON").after("<h6>sendMessage</h6><textarea class='form-control border border-info' rows='12'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
  $("#sentMessageResponse").removeClass("d-none");
});

//Request Title Token ==========================================================
$("#requestTitlTokenForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  console.log(formData);
  $.ajax({
    type:"POST",
    url: "requestDT.php",
    data:formData,
    success:function(response){
      console.log(response);
      var responseObj  = JSON.parse(response);
      console.log(responseObj);
      if (responseObj.fullHash == "failed"){
        var message = "<b style='color:red'>Decryption failed! Beware of counterfeiting. </b><br>Registration code was not generated by <code>demo account</code>. ";
        $("#requestTitlTokeneResult").html(message);
        alert("Decryption failed!");
      }else if (responseObj.fullHash == "mismatch"){
        var message= "<b style='color:red'>Mismatching! Beware of counterfeiting. </b><br>Secure code scaned: "+formData[1].value+"<br>Decrypted code: "+responseObj.decrypted;
        $("#requestTitlTokeneResult").html(message);
        alert("Mismatching!");
      }else{
        var fullHash     = responseObj.fullHash;
        var senderRS     = responseObj.transactionJSON.senderRS
        var timestamp    = responseObj.transactionJSON.timestamp;
        var recipientRS  = responseObj.transactionJSON.recipientRS;
        var asset        = responseObj.transactionJSON.attachment.asset;
        var transferTime = timestampToLocalFn(timestamp);
        var note = '<br><br><p><b>Note:</b> no transactionBytes will be broadcasted - broadcasted: false. For production version please download<a href="download.html">DApp</a> and review instructions.<br>'
        var requestDTResult = "<b style='color:green'>Request granted!</b><br> Title token, ID "+asset+" , transfered to wallet address: "+recipientRS+" . Transaction fullHash:"+fullHash+".";
        $("#requestTitlTokeneResult").html(requestDTResult+note);
        $("#requestTitlTokeneJSON").append("<h6>transferAsset</h6><textarea class='form-control border border-info' rows='12'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      };
    }
  });
  $("#requestTitlTokeneResponse").removeClass("d-none");
});

$("#pin2newWallet").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  console.log(formData);
  var getAccountId = [
    {name:"requestType",value:"getAccountId"},
    {name:"secretPhrase",value:formData[0].value},
  ];
  console.log(getAccountId);
  $.ajax({
    type:"POST",
    url: url,
    data:getAccountId,
    success:function(response){
      var responseObj  = JSON.parse(response);
      console.log(responseObj);
      $("#consumerWallet").val(responseObj.accountRS);
      $("#consumerPubKey").val(responseObj.publicKey);
      var accountRSConfig={
        width: 210,
        height: 210,
        text:responseObj.accountRS,
        PI:"#0C8918",
        quietZone: 25,
        logo:"images/logo-cc14-qr.png",
        logoWidth:100,
        logoHeight:50,
        title:"accountRS",
        titleHeight:30,
        titleTop:10,
        correctLevel: QRCode.CorrectLevel.H
      };
      var passphraseConfig={
        width: 210,
        height: 210,
        text:getAccountId[1].value,
        PI:"#177CB0",
        quietZone: 25,
        logo:"images/logo-cc14-qr.png",
        logoWidth:100,
        logoHeight:50,
        title:"Passphrase",
        titleHeight:30,
        titleTop:10,
        correctLevel: QRCode.CorrectLevel.Q
      };
      $("#requestTitlTokeneResponse").removeClass("d-none");
      var t=new QRCode(document.getElementById("newWalletQRCode"), accountRSConfig);
      var t=new QRCode(document.getElementById("newWalletQRCode"), passphraseConfig);
    }
  });
});


//Request CC14 Token =======================================================================================================
$("#requestCC14Form").submit(function(event){
  $("#requestCC14Response").removeClass("d-none");
  event.preventDefault();
  var formData = $(this).serializeArray();
  console.log(formData);
  var requestCC14 = [
    {name:"account",value: formData[0].value.trim()},
    {name:"publicKey",value: formData[1].value.trim()},
  ]
  $.ajax({
    type:"POST",
    url: "requestCC14.php",
    data: requestCC14,
    success:function(response){
      var responseObj  = JSON.parse(response);
      console.log(responseObj);
      if(responseObj.request =="rejected"){
        $("#requestCC14Result").html("Request reject");
        $("#requestCC14Result").html(responseObj.responses);
      }else{
        $("#requestCC14Result").html("Request approved");
        $("#requestCC14JSON").html("<h6>sendMoney</h6><textarea class='form-control border border-info' rows='12'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");

      };
    }
  });
  $("#requestTitlTokeneResponse").removeClass("d-none");
});

//transfer asset ===============================================================
$("#transferAssetForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  var getAsset = [
    {name:"requestType",value:"getAsset"},
    {name:"asset",value: formData[1].value.trim()},
  ];
  console.log(url);
  $.ajax({
    type:"POST",
    url: url,
    data:getAsset,
    success:function(response){
      var responseObj  = JSON.parse(response);
      $("#transferAssetJSON").append("<h6>getAsset</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      var factor = Math.pow(10, responseObj.decimals);
      var quantityQNT = factor*formData[2].value;
      var transferAsset = [
        {name:"requestType",value:"transferAsset"},
        // {name:"chain",value:"2"},
        {name:"broadcast", value:"false"},
        {name:"feeNQT", value:"0"},
        {name:"deadline", value:"60"},
        // {name:"feeRateNQTPerFXT", value:"-1"},
        {name:"recipient",value: formData[0].value.trim()},
        {name:"asset",value: formData[1].value.trim()},
        {name:"quantityQNT",value: quantityQNT},
        {name:"message",value: formData[3].value},
        {name:"secretPhrase",value: formData[4].value},
      ];
      $.ajax({
        type:"POST",
        url: url,
        data:transferAsset,
        success:function(response){
          var responseObj  = JSON.parse(response);
          var senderRS= responseObj.transactionJSON.senderRS;
          var recipientRS = responseObj.transactionJSON.recipientRS;
          var fee = responseObj.transactionJSON.feeNQT/100000000+" CC14";
          var transactionTime = timestampToLocalFn(responseObj.transactionJSON.timestamp);
          var fullHash = responseObj.fullHash;
          var transactionBytes = responseObj.transactionBytes;
          $("#transferAssetTbl-fee").html(fee);
          $("#transferAssetTbl-time").html(transactionTime[0]+" "+transactionTime[1]);
          $("#transferAssetTbl-senderRS").html(senderRS);
          $("#transferAssetTbl-recipientRS").html(recipientRS);
          $("#transferAssetTbl-fullHash").html(fullHash);
          $("#transferAssetTransactionBytes").html(transactionBytes);
          $("#transferAssetJSON").append("<h6>transferAsset</h6><textarea class='form-control border border-info' rows='12'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
        }
      });
    }
  });
  $("#transferAssetTbl-qty").html(formData[2].value);
  $("#transferAssetTbl-message").html(formData[3].value);
  $("#transferAssetResponse").removeClass("d-none");
});

//Voucher Transaction - Create =================================================
$("#createVoucherForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  var transferAsset = [
    {name:"requestType",value:"transferAsset"},
    // {name:"chain",value:"2"},
    {name:"feeNQT", value:"0"},
    {name:"deadline", value:"60"},
    // {name:"feeRateNQTPerFXT", value:"-1"},
    {name:"recipient",value: formData[4].value.trim()},
    {name:"asset",value: formData[1].value.trim()},
    {name:"quantityQNT",value: ""},
    {name:"message",value: formData[3].value},
    {name:"secretPhrase",value: formData[5].value},
    {name:"publicKey",value: ""},
    {name:"voucher",value: "true"},
  ];
  var getAsset = [                                            //get quantityQNT
    {name:"requestType",value:"getAsset"},
    {name:"asset",value: formData[1].value.trim()},
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:getAsset,
    success:function(response){
      var responseObj  = JSON.parse(response);
      $("#createVoucherJSON").append("<h6>getAsset</h6><textarea class='form-control border border-info' rows='9'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      var factor = Math.pow(10, responseObj.decimals);
      var quantityQNT = factor*formData[2].value;
      transferAsset[6].value = quantityQNT.toString();
      var getAccountPublicKey = [                             //get sender PublicKey
        {name:"requestType",value:"getAccountPublicKey"},
        {name:"account",value: formData[0].value.trim()},
      ];
      $.ajax({
        type:"POST",
        url: url,
        data:getAccountPublicKey,
        success:function(response){
          var responseObj  = JSON.parse(response);
          $("#createVoucherJSON").append("<h6>getAccountPublicKey</h6><textarea class='form-control border border-info' rows='2'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
          transferAsset[9].value = responseObj.publicKey;
          $.ajax({
            type:"POST",
            url: url,
            data:transferAsset,
            success:function(response){
              var responseObj  = JSON.parse(response);
              $("#processVoucherVoucherValidate").val(response);
              $("#createVoucherJSON").append("<h6>transferAsset - Voucher JSON</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
              var senderRS= responseObj.transactionJSON.senderRS;
              var recipientRS = responseObj.transactionJSON.recipientRS;
              var feeCC14 = responseObj.transactionJSON.feeNQT/10000000+" CC14";
              var transactionTime = timestampToLocalFn(responseObj.transactionJSON.timestamp);
              var fullHash = responseObj.fullHash;
              var recipientSignature = responseObj.signature;
              $("#createVoucherTbl-fee").html(feeCC14);
              $("#createVoucherTbl-time").html(transactionTime[0]+" "+transactionTime[1]);
              $("#createVoucherTbl-senderRS").html(senderRS);
              $("#createVoucherTbl-recipientRS").html(recipientRS);
              $("#createVoucherTbl-recipientSignature").html(recipientSignature);
              $("#processVoucherRecipientSignature").val(recipientSignature);
              var qrCodeConfig={
                width: 320,
                height: 320,
                text:recipientSignature,
                PI:"#177CB0",
                quietZone: 25,
                logo:"images/logo-cc14-qr.png",
                logoWidth:100,
                logoHeight:50,
                title:"Recipient Signature",
                subTitle:recipientRS,
                titleHeight:50,
                titleTop:20,
                subTitleTop: 40,
                correctLevel: QRCode.CorrectLevel.L
              };
              var t=new QRCode(document.getElementById("createVoucherQRcode"), qrCodeConfig);
            }
          });
        }
      });
    }
  });
  $("#createVoucherTbl-asset").html(formData[1].value);
  $("#createVoucherTbl-qty").html(formData[2].value);
  $("#createVoucherTbl-message").html(formData[3].value);
  $("#createVoucherResponse").removeClass("d-none");
});

//processVoucher validation ====================================================
$("#processVoucherValidationForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  var voucherStr=formData[1].value;
  var voucherObj = JSON.parse(voucherStr);
  $("#processVoucherInput").val(voucherStr);
  if (formData[0].value != voucherObj.signature){
    $("#processVoucherConfirmBtn").prop("disabled",true);
    $("#processVoucherResult").html("Mismatch! Recipient signature doesn't match with voucher, please review.");
  }else{
    $("#processVoucherResult").html("Matched! Recipient signature match with voucher, please proceed.");
    var senderRS= voucherObj.transactionJSON.senderRS;
    var recipientRS = voucherObj.transactionJSON.recipientRS;
    var feeCC14 = voucherObj.transactionJSON.feeNQT/10000000+" CC14";
    var transactionTime = timestampToLocalFn(voucherObj.transactionJSON.timestamp);
    var asset = voucherObj.transactionJSON.attachment.asset;
    var message = voucherObj.transactionJSON.attachment.message
    var fullHash = voucherObj.fullHash;
    var recipientSignature = voucherObj.signature;
    $("#processVoucherTbl-asset").html(asset);
    $("#processVoucherTbl-fee").html(feeCC14);
    $("#processVoucherTbl-time").html(transactionTime[0]+" " + transactionTime[1]);
    $("#processVoucherTbl-senderRS").html(senderRS);
    $("#processVoucherTbl-recipientRS").html(recipientRS);
    $("#processVoucherTbl-message").html(message);
    var getAsset = [                                           //get quantityQNT
      {name:"requestType",value:"getAsset"},
      {name:"asset",value: asset},
    ];
    $.ajax({
      type:"POST",
      url: url,
      data:getAsset,
      success:function(response){
        var responseObj = JSON.parse(response);
        var factor = Math.pow(10,responseObj.decimals);
        var qty = voucherObj.transactionJSON.attachment.quantityQNT/factor;
        $("#processVoucherTbl-qty").html(qty);
        $("#processVoucherJSON").append("<h6>getAsset</h6><textarea class='form-control border border-info' rows='9'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      }
    });
  };
  $("#processVoucherResponse").removeClass("d-none");
});

//processVoucher sign and boardcat==============================================
function processVoucherFn(formData){
  var form = document.getElementById('processVoucherForm');
  var action = form.getAttribute('action');
  var processVoucherXhr= new XMLHttpRequest();
  var formDataAdj = new FormData(formData);
  processVoucherXhr.onreadystatechange = function() {
    if (processVoucherXhr.readyState == 4 && processVoucherXhr.status == 200) {
      var responseObj=JSON.parse(processVoucherXhr.responseText);
      var note = "<b>Note: </b>Transaction didn't borcasted in order to maintain minimum balance of demonstration account. Such limitaion will be removed from production version."
      $("#processVoucherResult").html("Asset transfered! Transaction full hash: <br>"+ responseObj.signedTransaction.fullHash + "<br>" +note);
      $("#processVoucherJSON").append("<h6>processVoucher</h6><textarea class='form-control border border-info' rows='9'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  };
  processVoucherXhr.open("POST",action, true);
  processVoucherXhr.send(formDataAdj);
  return false;
};

//decode fielToken =============================================================
function decodeFileTokenFn(formData){
  var decFileTokenXhr = new XMLHttpRequest();
  var formDataMod = new FormData(formData);
  decFileTokenXhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var decFileTokenXhrObj=JSON.parse(decFileTokenXhr.responseText);
      var input = document.querySelector('#decFileTokenFormFile');
      var valid = decFileTokenXhrObj.valid;
      var accountRS = decFileTokenXhrObj.accountRS;
      var timestamp = decFileTokenXhrObj.timestamp;
      var localTime = timestampToLocalFn(timestamp);
      var file = input.files[0];
      var fileName = file.name;
      var lastModified=timestampToLocalFn(file.lastModified/1000-epochBeginning);
      var fileSize = returnFileSizeFn(file.size);
      if (valid==true){
        var message = "<b>Validation passed! </b>";
      }else {
        var message = "<b>Validation failed! </b>";
      };
      $("#decFileTokenResponse").removeClass("d-none");
      $("#decFileTokenResult").html(message);
      $("#decFileTokenTbl-generator").html(accountRS);
      $("#decFileTokenTbl-time").html(localTime[0] + " " +localTime[1]);
      $("#decFileTokenTbl-file").html("file name: "+fileName + ", <br>file size: " + fileSize+" , <br>last modified:  " + lastModified[0] + " , " +lastModified[1]);
      $("#decFileTokenJSON").html("<h6>decodeFileToken</h6><textarea class='form-control border border-info' rows='6'>" + JSON.stringify(decFileTokenXhrObj,undefined, 4)+"</textarea>");
    }
  };
  decFileTokenXhr.open("POST",url, true);
  decFileTokenXhr.send(formDataMod);
  return false;
};


// issue anti counterfeit product ==============================================
$("#issueNFTForm").submit(function(event){
  event.preventDefault();
  sessionStorage.clear();
  var formData = $(this).serializeArray();
  console.log(formData);
  var barcode=parseInt(formData[0].value);
  var name = barcode.toString(32);
  var issueAsset = [
    {name:"requestType",value:"issueAsset"},
    {name:"name",value: name},
    {name:"description",value: "NFTID"},
    {name:"quantityQNT",value:"1"},
    {name:"decimals",value: "0"},
    {name:"secretPhrase",value:formData[3].value},
    {name:"feeNQT",value:"0"},
    {name:"deadline", value:"60"},
    {name:"broadcast",value:"false"},
    {name:"message",value:formData[2].value},
  ];
  var issueQty=parseInt(formData[4].value);
  if(issueQty >5 && (issueAsset[5].value)==secretPhraseIssuance){
    $("#issueNFTBroadcastBtn").prop('disabled', true);
  };
  var fullHashArray=new Array(issueQty);
  var assetIDArray=new Array(issueQty);
  var transactionBytesArray=new Array(issueQty);
  var i=0;
  issueNFTFn();
  function issueNFTFn(){
    if(i<issueQty){
      $.ajax({
        type:"POST",
        url: url,
        data:issueAsset,
        success:function(response){
          var responseObj = JSON.parse(response);
          console.log(responseObj);
          var feeCC14=responseObj.transactionJSON.feeNQT/100000000;
          fullHashArray[i]=responseObj.fullHash;
          var timestamp=responseObj.transactionJSON.timestamp;
          var senderRS=responseObj.transactionJSON.senderRS;
          transactionBytesArray[i]=responseObj.transactionBytes;
          var description=responseObj.transactionJSON.attachment.description;
          var message=responseObj.transactionJSON.attachment.message;
          assetIDArray[i]=NRS.fullHashToId(fullHashArray[i]);
          var regCodeText = encryptAESFn(assetIDArray[i], keyAES, ivAES);
          var issueTime = timestampToLocalFn(timestamp);
          var n=i+1;
          var issueNFTTbl = "<tr><td>"+n+
                            "</td><td>&#160;"+assetIDArray[i] +
                            "</td><td>"+regCodeText+
                            "</td><td>"+fullHashArray[i]+
                            "</td><td>&#160;"+barcode+
                            "</td><td>"+name+
                            "</td><td>&#160;"+assetIDArray[i]+
                            "</td><td>"+message+
                            "</td><td>"+senderRS+
                            "</td><td>"+issueTime[0]+" "+issueTime[1]+
                            "</td><td>"+feeCC14+
                            "</td></tr>";
          if(i==0){
            issueNFTQRCodeFn(assetIDArray[i],regCodeText);
            $("#issueNFTResultTbl tbody").append(issueNFTTbl);
            $("#issueNFTJSON").after("<h6>issueAsset - NFT#"+n+"</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
            i++;
            issueNFTFn();
          }else if (assetIDArray[i] != assetIDArray[i-1]) {
            issueNFTQRCodeFn(assetIDArray[i],regCodeText);
            $("#issueNFTResultTbl tbody").append(issueNFTTbl);
            $("#issueNFTJSON").after("<h6>issueAsset - NFT#"+n+"</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
            sessionStorage.setItem("issueNFTBroadcast", JSON.stringify(transactionBytesArray));
            i++;
            issueNFTFn();
          }else if (assetIDArray[i] == assetIDArray[i-1]) {
            setTimeout(function() {
              issueNFTFn();
            }, 1000);
          };
        }
      });
    };
  };
  $("#issueNFTResponse").removeClass("d-none");
});

// issue anti counterfeit product =============================================
function encryptAESFn(string, key, ivstr) {
     let ckey = CryptoJS.enc.Utf8.parse(key);
     let encrypted = CryptoJS.AES.encrypt(string, ckey, {
         mode: CryptoJS.mode.CBC,
         padding: CryptoJS.pad.Pkcs7,
         iv:CryptoJS.enc.Utf8.parse(ivstr)
     });
     return encrypted.ciphertext.toString();
};

// issue anti counterfeit product broadcast ====================================
$("#issueNFTBroadcastForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  console.log(formData);
  var arrayData = sessionStorage.getItem("issueNFTBroadcast");
  var array = JSON.parse(arrayData);
  console.log(array);
  for (var i=0; i <array.length; i++){
    formData[1].value = array[i];
      console.log(formData);
    $.ajax({
      type:"POST",
      url: url,
      data:formData,
      success:function(response)
      {
        var n=i+1;
        $("#issueNFTJSON").after("<h6>broadcastTransaction - NFT#"+n+"</h6>"+response);
      }
    });
  }
});

//  issue anti counterfeit product QR code =====================================
function issueNFTQRCodeFn(assetID,regCode){
  var config = {
    width: 240,
    height: 240,
    text:assetID,
    PI:"#0C8918",
    quietZone: 25,
    logo:"images/logo-cc14-qr.png",
    logoWidth:100,
    logoHeight:50,
    title:"Secure Code",
    subTitle:"ID: "+assetID,
    titleHeight:50,
    titleTop:20,
    subTitleTop: 40,
    correctLevel: QRCode.CorrectLevel.H
    };
  var t=new QRCode(document.getElementById("issueNFTQRCode"), config);
  var regCodeConfig=config;
  regCodeConfig.text=regCode;
  regCodeConfig.PI="#177CB0";
  regCodeConfig.title="Registration Code";
  correctLevel: QRCode.CorrectLevel.Q
  var s=new QRCode(document.getElementById("issueNFTQRCode"), regCodeConfig);
};

// issue anti counterfeit product with predefined serial number=================
$("#issueNFTwSNoForm").submit(function(event){
  event.preventDefault();
  sessionStorage.clear();
  var formData = $(this).serializeArray();
  console.log(formData);
  var barcode=parseInt(formData[0].value);
  var name = barcode.toString(32);
  var serialNumbers=JSON.parse(formData[1].value);
  var serialNoQty = serialNumbers.length;
  // console.log(serialNumbers);
  // console.log(serialNumbers.length);
  console.log(serialNoQty);
  var fullHashArray=new Array(serialNoQty);
  var assetIDArray=new Array(serialNoQty);
  var transactionBytesArray=new Array(serialNoQty);
  var i=0;
  issueNFTwSNoFn();
  function issueNFTwSNoFn(){
    if(i<serialNoQty){
      var issueAsset = [
        {name:"requestType",value:"issueAsset"},
        {name:"name",value: name},
        {name:"description",value: serialNumbers[i]},
        {name:"quantityQNT",value:"1"},
        {name:"decimals",value: "0"},
        {name:"secretPhrase",value:formData[3].value},
        {name:"feeNQT",value:"0"},
        {name:"deadline", value:"60"},
        {name:"broadcast",value:"false"},
        {name:"message",value:formData[2].value},
      ];

      $.ajax({
        type:"POST",
        url: url,
        data:issueAsset,
        success:function(response){
          var responseObj = JSON.parse(response);
          console.log(responseObj);
          var feeCC14=responseObj.transactionJSON.feeNQT/100000000;
          fullHashArray[i]=responseObj.fullHash;
          var timestamp=responseObj.transactionJSON.timestamp;
          var senderRS=responseObj.transactionJSON.senderRS;
          transactionBytesArray[i]=responseObj.transactionBytes;
          var description=responseObj.transactionJSON.attachment.description;
          var message=responseObj.transactionJSON.attachment.message;
          assetIDArray[i]=NRS.fullHashToId(fullHashArray[i]);
          var regCodeText = encryptAESFn(assetIDArray[i], keyAES, ivAES);
          var issueTime = timestampToLocalFn(timestamp);
          var n=i+1;
          var issueNFTTbl = "<tr><td>"+n+
                            "</td><td>&#160;"+assetIDArray[i] +
                            "</td><td>"+regCodeText+
                            "</td><td>"+fullHashArray[i]+
                            "</td><td>&#160;"+barcode+
                            "</td><td>"+name+
                            "</td><td>&#160;"+serialNumbers[i]+
                            "</td><td>"+message+
                            "</td><td>"+senderRS+
                            "</td><td>"+issueTime[0]+" "+issueTime[1]+
                            "</td><td>"+feeCC14+
                            "</td></tr>";
          if(i==0){
            issueNFTwSNoQRCodeFn(assetIDArray[i],regCodeText);
            $("#issueNFTwSNoResultTbl tbody").append(issueNFTTbl);
            $("#issueNFTwSNoJSON").after("<h6>issueAsset - NFT#"+n+"</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
            i++;
            issueNFTwSNoFn();
          }else if (assetIDArray[i] != assetIDArray[i-1]) {
            issueNFTwSNoQRCodeFn(assetIDArray[i],regCodeText);
            $("#issueNFTwSNoResultTbl tbody").append(issueNFTTbl);
            $("#issueNFTwSNoJSON").after("<h6>issueAsset - NFT#"+n+"</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
            sessionStorage.setItem("issueNFTwSNoBroadcast", JSON.stringify(transactionBytesArray));
            i++;
            issueNFTwSNoFn();
          }else if (assetIDArray[i] == assetIDArray[i-1]) {
            setTimeout(function() {
              issueNFTwSNoFn();
            }, 1000);
          };
        }
      });
    };
  };
  $("#issueNFTwSNoResponse").removeClass("d-none");
});

// issue anti counterfeit product broadcast ====================================
$("#issueNFTwSNoBroadcastForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  console.log(formData);
  var arrayData = sessionStorage.getItem("issueNFTwSNoBroadcast");
  var array = JSON.parse(arrayData);
  console.log(array);
  for (var i=0; i <array.length; i++){
    formData[1].value = array[i];
      console.log(formData);
    $.ajax({
      type:"POST",
      url: url,
      data:formData,
      success:function(response)
      {
        var n=i+1;
        $("#issueNFTwSNoJSON").after("<h6>broadcastTransaction - NFT#"+n+"</h6>"+response);
      }
    });
  }
});


function issueNFTwSNoQRCodeFn(assetID,regCode){
  var config = {
    width: 240,
    height: 240,
    text:assetID,
    PI:"#0C8918",
    quietZone: 25,
    logo:"images/logo-cc14-qr.png",
    logoWidth:100,
    logoHeight:50,
    title:"Secure Code",
    subTitle:"ID: "+assetID,
    titleHeight:50,
    titleTop:20,
    subTitleTop: 40,
    correctLevel: QRCode.CorrectLevel.H
    };
  var t=new QRCode(document.getElementById("issueNFTwSNoQRCode"), config);
  var regCodeConfig=config;
  regCodeConfig.text=regCode;
  regCodeConfig.PI="#177CB0";
  regCodeConfig.title="Registration Code";
  correctLevel: QRCode.CorrectLevel.Q
  var s=new QRCode(document.getElementById("issueNFTwSNoQRCode"), regCodeConfig);
};

//assetActivation search =======================================================
$("#activationSearchForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  var getAccountAssets = [
    {name:"requestType", value:"getAccountAssets"},
    {name:"account", value:formData[0].value.trim()},
    {name:"includeAssetInfo", value:"true"},
  ];
  if (walletActivation.includes(formData[0].value)){
    $(".activationConfirmRecipient").prop("disabled", true)
  }
  var issuerIdx = walletsObj.map(function(e) {return e.accountRS; }).indexOf(formData[0].value);
  if (issuerIdx>=0){
    $("#activationConfirmFormPassword").val(walletsObj[issuerIdx].secretPhrase);
  };
  $("#activationJSONDisplay").removeClass("d-none");
  $("#activationSearchTblDisplay").removeClass("d-none");
  $("#activationConfirmFormMessage").val(formData[1].value);
  $.ajax({            // getAccountAssets list of all assets for account enteren
    type:"POST",
    url: url,
    data:getAccountAssets,
    success:function(response){
      var responseObj=JSON.parse(response);
      getAccountAssetsObj2=JSON.parse(response);
      $("#activationJSON").append("<h6>getAccountAssets</h6><textarea class='form-control border border-info' rows='8'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      sessionStorage.setItem('getAccountAssets', response);
    }
  });
  var getAccountAssetsObj=JSON.parse(sessionStorage.getItem('getAccountAssets'));
  var getAssetHistory = [
    {name:"requestType", value:"getAssetHistory"},
    {name:"asset", value:""},
    {name:"includeAssetInfo", value:"true"},
  ];
  for(var i=0; i< getAccountAssetsObj.accountAssets.length; i++){
    getAssetHistory[1].value=getAccountAssetsObj.accountAssets[i].asset;
    $.ajax({              // getAssetHistory for each assets of getAccountAssets
      type:"POST",
      url: url,
      data:getAssetHistory,
      success:function(response){
        var responseObj=JSON.parse(response);
        // console.log(responseObj);
        var length      = responseObj.assetHistory.length;
        var name        = responseObj.assetHistory[length-1].name;
        var decimals    = responseObj.assetHistory[length-1].decimals;
        var timestamp   = responseObj.assetHistory[length-1].timestamp;
        var asset       = responseObj.assetHistory[length-1].asset;
        var issuer      = responseObj.assetHistory[length-1].accountRS;
        // var fullHash    = responseObj.assetHistory[length-1].assetHistoryFullHash;
        var quantityQNT = responseObj.assetHistory[length-1].quantityQNT;
        var factor      = Math.pow(10, decimals);
        var issuedQty   = quantityQNT/factor;
        var barcode     = parseInt(name, 32).toString(10);
        var issueTime   = timestampToLocalFn(timestamp);
        if (!walletIssuance.includes(issuer)){
          var activationSearchTbl = "<tr><td>"+barcode+
            "</td><td>"+asset+
            "</td><td>"+issueTime[0]+" "+issueTime[2]+" days"+
            "</td><td class='alert3'>Burn "+issuer+
            "</td><td>"+issuedQty+
            "</td><td>"+decimals+
            // "</td><td>"+fullHash+
            "</td></tr>";
        }else {
          var activationSearchTbl = "<tr><td>"+barcode+
            "</td><td>"+asset+
            "</td><td>"+issueTime[2]+"Days "+issueTime[0]+
            "</td><td>"+issuer+
            "</td><td>"+issuedQty+
            "</td><td>"+decimals+
            // "</td><td>"+fullHash+
            "</td></tr>";
        };
        $("#activationJSON").append("<h6>getAssetHistory</h6><textarea class='form-control border border-info' rows='17'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
        $("#activationSearchTbl tbody").append(activationSearchTbl);
      }
    });
  };
});

// dataTablesFn ================================================================
function dataTablesFn() {
  $('#activationSearchTbl tfoot th').each( function () {
    var title = $(this).text();
    $(this).html( '<input type="text" placeholder=" '+title+'" />' );
    } );
  var table = $('#activationSearchTbl').DataTable({
    "iDisplayLength": 100,
    initComplete: function () {
      this.api().columns().every( function () {
        var that = this;
        $( 'input', this.footer() ).on( 'keyup change clear', function () {
          if ( that.search() !== this.value ) {
            that
            .search( this.value )
            .draw();
          }
        } );
      } );
    }
  });
};

//activation Confirm ===========================================================
$("#activationConfirmForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  var activationSearchFiltered=[];
  $("#activationSearchTbl tbody tr").each(function(){
    activationSearchFiltered.push($(this).find("td").eq(1).text());
  });
  console.log(activationSearchFiltered);
  activationSearchFiltered.forEach(activateAssetFn);
  function activateAssetFn(item){
    var transferAsset = [
      {name:"requestType",      value:"transferAsset"},
      {name:"deadline",         value:"60"},
      {name:"recipient",        value:formData[0].value},
      {name:"asset",            value:item},
      {name:"quantityQNT",      value:"1"},
      {name:"secretPhrase",     value:formData[1].value},
      {name:"feeNQT",           value:"100000000"},
      {name:"message",          value:formData[2].value}
    ];
    $.ajax({
      type:"POST",
      url: url,
      data:transferAsset,
      success:function(response){
        var responseObj  = JSON.parse(response);
        var fullHash     = responseObj.fullHash;
        var feeCC14      = responseObj.transactionJSON.feeNQT/100000000;
        var timestamp    = responseObj.transactionJSON.timestamp;
        var recipientRS  = responseObj.transactionJSON.recipientRS;
        var asset        = responseObj.transactionJSON.attachment.asset;
        var activateTime = timestampToLocalFn(timestamp);
        var activationConfirmTbl = "<tr><td>"+asset+
                                   "</td><td>"+recipientRS+
                                   "</td><td>"+feeCC14+
                                   "</td><td>"+activateTime[0]+ " " + activateTime[1]+
                                   "</td><td>"+fullHash+
                                   "</td></tr>";
        $("#activationConfirmTbl tbody").append(activationConfirmTbl);
        $("#activationJSON").append("<h6>transferAsset - "+ transferAsset[3].value+" </h6><textarea class='form-control border border-info' rows='17'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      }
    });
  };
  $("#activationConfirmTblDisp").removeClass("d-none");
});


// issue traceable Asset =======================================================
$("#issueAssetForm").submit(function(event){
  event.preventDefault();
  var formData    = $(this).serializeArray();
  var factor      = Math.pow(10,formData[1].value);
  var quantityQNT = factor*formData[0].value;
  var barcode     = parseInt((formData[2].value));
  var name        = barcode.toString(32);
  var issueAsset  = [
    {name:"requestType",      value:"issueAsset"},
    // {name:"chain",            value:"2"},
    {name:"name",             value:name},
    {name:"description",      value:formData[3].value},
    {name:"quantityQNT",      value:quantityQNT},
    {name:"decimals",         value:formData[1].value},
    {name:"secretPhrase",     value:formData[5].value},
    {name:"feeNQT",           value:"0"},
    {name:"deadline",         value:"60"},
    // {name:"feeRateNQTPerFXT", value:"-1"},
    {name:"broadcast",        value:"false"},
    {name:"message",          value:formData[4].value}
  ];
  console.log(formData[5].value);
  // remove this line for production version====================================
  if((formData[5].value)=="ci di wu yin 301 liang ge bi wang er bu ceng tou"){
    $("#issueAssetBroadcastBtn").prop('disabled', true);

  };
  // remove this line for production version====================================
  $.ajax({
    type:"POST",
    url: url,
    data:issueAsset,
    success:function(response){
      var responseObj      = JSON.parse(response);
      var feeCC14          = responseObj.transactionJSON.feeNQT/100000000;
      var issuerRS         = responseObj.transactionJSON.senderRS;
      var timestamp        = responseObj.transactionJSON.timestamp;
      var transactionBytes = responseObj.transactionBytes;
      var descriptionStr   = responseObj.transactionJSON.attachment.description;
      var message          = responseObj.transactionJSON.attachment.message;
      var fullHash         = responseObj.fullHash;
      var quantityQNT      = responseObj.transactionJSON.attachment.quantityQNT;
      var factor           = Math.pow(10, responseObj.transactionJSON.attachment.decimals);
      var quantity         = quantityQNT/factor;
      var assetID          = NRS.fullHashToId(fullHash);
      var issueTime        = timestampToLocalFn(timestamp);
      var descriptionObj   = JSON.parse(descriptionStr);
      var unit             = descriptionObj.unit;
      var lotNo            = descriptionObj.lotNo;
      var issueAssetResult = "<table class='table table-sm text-nowrap fs-6 table-bordered border-info caption-top'>"+
        "<tr><td>issuer</td><td>"+issuerRS+"</td></tr>"+
        "<tr><td>issueTime</td><td>"+issueTime[0]+" "+issueTime[1]+"</td></tr>"+
        "<tr><td>name</td><td>"+name+"</td></tr>"+
        "<tr><td>quantity</td><td>"+quantity.toFixed(responseObj.transactionJSON.attachment.decimals)+" "+unit+"</td></tr>"+
        "<tr><td>assetID</td><td>"+assetID+"</td></tr>"+
        "<tr><td>decimals</td><td>"+responseObj.transactionJSON.attachment.decimals+"</td></tr>"+
        "<tr><td>lot No</td><td>"+lotNo+"</td></tr>"+
        "<tr><td>fullHash</td><td>"+responseObj.fullHash+"</td></tr>"+
        "<tr><td>fee</td><td>"+feeCC14+" CC14 </td></tr>"+
        "<tr><td>message</td><td>"+responseObj.transactionJSON.attachment.message+"</td></tr></table> ";
      $("#issueAssetResult").html(issueAssetResult);
      $("#issueAssetTransactionBytes").val(transactionBytes);
      $("#issueAssetJSON").after("<h6>issueAsset</h6><textarea class='form-control border border-info' rows='17'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      var config = {
        width: 160,
        height: 160,
        text:assetID,
        PI:"#0C8918",
        quietZone: 25,
        logo:"images/logo-cc14-qr.png",
        logoWidth:80,
        logoHeight:40,
        title:"Secure Code",
        subTitle:assetID,
        titleHeight:50,
        titleTop:20,
        subTitleTop: 40,
        correctLevel: QRCode.CorrectLevel.H
        };
        var t=new QRCode(document.getElementById("issueAssetQRCode"), config);
      }
    });
  $("#issueAssetDisplay").removeClass("d-none");
});

// set Asset Property ==========================================================
$("#setAssetPropertyForm").submit(function(event){
  event.preventDefault();
  $("#setAssetPropertyDisplay").removeClass("d-none");
  var formData = $(this).serializeArray();
  console.log(formData);
  var setAssetProperty  = [
    {name:"requestType",      value:"setAssetProperty"},
    // {name:"chain",            value:"2"},
    {name:"asset",            value:formData[0].value.trim()},
    {name:"property",         value:formData[1].value},
    {name:"value",            value:formData[2].value},
    {name:"secretPhrase",     value:formData[4].value},
    {name:"feeNQT",           value:"0"},
    {name:"deadline",         value:"60"},
    // {name:"feeRateNQTPerFXT", value:"-1"},
    {name:"broadcast",        value:"false"},
    {name:"message",          value:formData[3].value}
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:setAssetProperty,
    success:function(response){
      var responseObj = JSON.parse(response);
      console.log(responseObj);
      var feeCC14          = responseObj.transactionJSON.feeNQT/100000000;
      var setterRS         = responseObj.transactionJSON.senderRS;
      var timestamp        = responseObj.transactionJSON.timestamp;
      var transactionBytes = responseObj.transactionBytes;
      var property         = responseObj.transactionJSON.attachment.property;
      var propertyValue    = responseObj.transactionJSON.attachment.value;
      var assetID          = responseObj.transactionJSON.attachment.asset;
      var setTime          = timestampToLocalFn(timestamp);
      var result = "<table class='table table-sm text-nowrap fs-6 table-bordered border-info caption-top'>"+
        "<tr><td>setterRS</td><td>"+setterRS+"</td></tr>"+
        "<tr><td>setTime</td><td>"+setTime[0]+" "+setTime[1]+"</td></tr>"+
        "<tr><td>assetID</td><td>"+assetID+"</td></tr>"+
        "<tr><td>property</td><td>"+property+"</td></tr>"+
        "<tr><td>value</td><td>"+propertyValue+"</td></tr>"+
        "<tr><td>fullHash</td><td>"+responseObj.fullHash+"</td></tr>"+
        "<tr><td>fee</td><td>"+feeCC14+" CC14 </td></tr></table>";
      $("#setAssetPropertyResult").html(result);
      $("#setAssetPropertyTransactionBytes").val(transactionBytes);
      $("#setAssetPropertyJSON").after("<h6>setAssetProperty</h6><textarea class='form-control border border-info' rows='17'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
});

//export web table to excel ====================================================
$("#table2excel").click(function(){
  var secEpoch = Math.floor( Date.now() / 1000 );
  $("#issueNFTResultTbl").table2excel({
    exclude: ".noExl",
    name: "Worksheet Name",
    filename:"NFT_"+secEpoch,
    fileext: ".xls"
  });
});

$("#table2excelwSno").click(function(){
  var secEpoch = Math.floor( Date.now() / 1000 );
  $("#issueNFTwSNoResultTbl").table2excel({
    exclude: ".noExl",
    name: "Worksheet Name",
    filename:"NFT_"+secEpoch,
    fileext: ".xls"
  });
});
// return File Size Fn =========================================================
function returnFileSizeFn(number) {
  if(number < 1024) {
    return number + ' bytes';
  } else if(number > 1024 && number < 1048576) {
    return (number/1024).toFixed(1) + ' KB';
  } else if(number > 1048576) {
    return (number/1048576).toFixed(1) + ' MB';
  }
};

// get Asset Info All in one ===================================================
$("#getAssetInfoAll").submit(function(event){
  event.preventDefault();
  $("#searchResult").removeClass("d-none");
  $("#modalBlock").removeClass("d-none");
  $("#panelAdvisory").addClass("show");
  $("#btnAdvisory").removeClass("collapsed");
  $("#btnAdvisory").attr("aria-expanded","true");
  $("#panelJSONresponse").addClass("show");
  $("#btnJSONresponse").removeClass("collapsed");
  $("#btnJSONresponse").attr("aria-expanded","true");
  var formData= $(this).serializeArray();
  console.log(formData);
  console.log(formData[0].value.trim());
  var getAsset= [
    {name:"requestType",value:"getAsset"},
    {name:"asset",value:formData[0].value.trim()},
  ];
  // $.post(url,formData,function(response){
  $.ajax({
    type:"POST",
    url: url,
    data:getAsset,
    success:function(response){
      var assetObj = JSON.parse(response);
      $("#assetInforTbl-assetID").html(assetObj.asset);
      $("#JSONresponse").append("<h6>getAsset</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(assetObj,undefined, 4)+"</textarea>");
      if (assetObj.errorDescription =="Unknown asset"){
        $("#panelAdvisory").html("<h6>No blockchain record found，Crypto C14 is unable to provide any suggestion nor advisory. please verify secure code sanned.</h6>");
        $("#testTable").hide();
      }else{
        $("#panelProduct").addClass("show");
        $("#btnProduct").removeClass("collapsed");
        $("#btnProduct").attr("aria-expanded","true");
        $("#panelIssuer").addClass("show");
        $("#btnIssuer").removeClass("collapsed");
        $("#btnIssuer").attr("aria-expanded","true");
        $("#testTable").show();
        assetInfoFn(assetObj.name,assetObj.asset);         // assetInfoFn 商品信息
        assetPropertyFn(assetObj.asset);                             //产品附加信息
        assetIssueDateFn(assetObj.asset);                                 //q2, q3
        assetInventoryFn(assetObj.asset, assetObj.decimals);         //溯源产品库存
        if (assetObj.quantityQNT==0) {
          assetTransferNFTFn(assetObj.asset);
          $("#test-q4-yes").html("");
          $("#test-q4-no").html("&#x2716;");
          $("#advisoryA4").removeClass("d-none");
          $("#test-q5-yes").html("");
          $("#test-q5-no").html("&#x2716;");
          $("#advisoryA5").removeClass("d-none");
          $("#test-q7-yes").html("");
          $("#test-q7-no").html("&#x2716;");
          $("#advisoryA7").removeClass("d-none");
        }else if (assetObj.quantityQNT >1) {
          assetTransferTraceableFn(assetObj.asset);
          $("#test-q1").hide();
          $("#test-q5").hide();
          $("#test-q6").hide();
          $("#test-q7").hide();
          $("#test-q8").hide();
          $("#test-q9").hide();
          $("#advisoryA5").hide();
          $("#advisoryA6").hide();
          $("#advisoryA7").hide();
          $("#advisoryA8").hide();
          $("#advisoryA9").hide();
          $("#assetInforTbl-r8").hide();
          $("#test-q4-yes").html("&#x2714;");
          $("#test-q4-no").html("");
          $("#advisoryA1").removeClass("d-none");
          $("#requestTitleBtn").prop("disabled",true);
        }else if(assetObj.quantityQNT==1 && assetObj.decimals == 0){
          assetTransferNFTFn(assetObj.asset);
          $("#test-q1-yes").html("&#x2714;");
          $("#test-q1-no").html("");
          $("#modalRequestAsset").val(assetObj.asset);
        };
      };
    }
  });
});

//get asset property ==========================================================
function assetPropertyFn(assetID){
  $.post(url,"requestType=getAssetProperties&asset="+assetID,function(response){
    var assetPropertyObj = JSON.parse(response);
    $("#JSONresponse").append("<h6>getAssetProperties</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(assetPropertyObj,undefined, 4)+"</textarea>");
    var i= assetPropertyObj.properties.length;
    var setter;
    if (i>=1){
      for(k=0; k<i; k++){
        var setterRS = assetPropertyObj.properties[k].setterRS;
        var property = assetPropertyObj.properties[k].property;
        var value = assetPropertyObj.properties[k].value;
        var m = myAddressBookObj.map(function(e){return e.accountRS;}).indexOf(setterRS);
        if (m > 0){
          setter = myAddressBookObj[m].name;
          duty = myAddressBookObj[m].duty;
        }else{
          setter = "Unknow wallet, anonumous asset property setter.";
          duty = "Unclassified, <a href='utilities.html'>contact setter</a>";
        };
        var index = k+1;
        displayTbl='<table class="table word-break table-bordered table-sm fs-6 table-bordered caption-top">'+
                   '<caption>Property ' + index +'/'+i+' </caption>'+
                   '<tr><td class="td-1">Setter</td><td class="td-2">' + setter +'</td></tr>'+
                   '<tr><td class="td-1">setterRS</td><td class="td-2">' + setterRS +'</td></tr>'+
                   '<tr><td class="td-1">Responsibility</td><td class="td-2">' + duty +'</td></tr>'+
                   '<tr><td class="td-1">'+property+'</td><td class="td-2">' + value +'</td></tr></table>';
        $("#assetInforTbl").after(displayTbl);
      };
    };
  });
};

// asset accounts asset distribution ===========================================
function assetInventoryFn(assetID, decimals){
  var factor = Math.pow(10, decimals);
  $.post(url,"requestType=getAssetAccounts&asset="+assetID,function(response){
    var assetAccountObj = JSON.parse(response);
    $("#JSONresponse").append("<h6>getAssetAccounts</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(assetAccountObj,undefined, 4)+"</textarea>");
    var i= assetAccountObj.accountAssets.length;
      for (k=0; k<i; k++){
        var accountRS = assetAccountObj.accountAssets[k].accountRS;
        var quantityQNT = assetAccountObj.accountAssets[k].quantityQNT;
        var quantity = quantityQNT/factor;
        var index = k+1;
        var m = myAddressBookObj.map(function(e){return e.accountRS;}).indexOf(accountRS);
        if (m > 0){
          account = myAddressBookObj[m].name;
          duty = myAddressBookObj[m].duty;
          $("#test-q7-yes").html("&#x2714;");
          $("#test-q7-no").html("");
        }else{
          account = "Unknow wallet. You may ask seller to proof ownership of this wallet by using <a href='evidence.html'>Generate message token</a> for an arbitrary message. If wallet validation is not an option, please move on to another item.";
          duty = "Unclassified, <a href='utilities.html'>contact wallet owner</a>";
          $("#test-q7-yes").html("");
          $("#test-q7-no").html("&#x2716;");
        };
        displayTbl='<table class="table word-break table-bordered table-sm fs-6 table-bordered caption-top">'+
                   '<caption>Current owner ' + index +'/'+i+' </caption>'+
                   '<tr><td class="td-1">Entity</td><td class="td-2">' + account +'</td></tr>'+
                   '<tr><td class="td-1">accountRS</td><td class="td-2">' + accountRS +'</td></tr>'+
                   '<tr><td class="td-1">Responsibility</td><td class="td-2">' + duty +'</td></tr>'+
                   '<tr><td class="td-1">Inventory</td><td class="td-2">' + quantity.toFixed(decimals) + '  (quantityQNT: '+quantityQNT+' , decimals: '+decimals+' )'+'</td></tr></table>';
        $("#testTable").after(displayTbl);
      };
  });
};

// asset transfers NFT =========================================================
function assetTransferNFTFn(asset){
  $("#panelHistory").addClass("show");
  $("#btnHistory").removeClass("collapsed");
  $("#btnHistory").attr("aria-expanded","true");
  $.post(url,"requestType=getAssetTransfers&includeAssetInfo=true&asset="+asset,function(response){
    var assetTransferObj = JSON.parse(response);
    $("#JSONresponse").append("<h6>getAssetTransfers</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(assetTransferObj,undefined, 4)+"</textarea>");
    var length= assetTransferObj.transfers.length;
    if (length>0) {
      for(var i=0; i<length; i++){
        var senderRS    = assetTransferObj.transfers[i].senderRS;
        var recipientRS = assetTransferObj.transfers[i].recipientRS;
        var quantityQNT = assetTransferObj.transfers[i].quantityQNT;
        var decimals    = assetTransferObj.transfers[i].decimals;
        var timestamp   = assetTransferObj.transfers[i].timestamp;
        var fullHash    = assetTransferObj.transfers[i].assetTransferFullHash;
        var factor    = Math.pow(10, decimals);
        var qty       = quantityQNT/factor;
        var localTime = timestampToLocalFn(timestamp);
        if(walletActivation.includes(recipientRS)){
          $("#test-q9-yes").html("&#x2714;");
          $("#test-q9-no").html("");
          $("#advisoryA9").hide();
          $("#assetInforTbl-activateDate").html(localTime[0] +" " + localTime[1] + ", "+localTime[2]+" days");
        };
        var m = myAddressBookObj.map(function(e){return e.accountRS;}).indexOf(senderRS);
        if (m < 0){
          var sender = "Unknow wallet, anonumous sender.)";
          var senderDuty = "Unclassified, <a href='utilities.html'>contact sender</a>";
          senderLevel = 6;
        }else{
          var sender = myAddressBookObj[m].name;
          var senderLevel = myAddressBookObj[m].level;
          var senderDuty = myAddressBookObj[m].duty;
        };
          var n = myAddressBookObj.map(function(e){return e.accountRS;}).indexOf(recipientRS);
          if (n < 0){
            recipient = "Unknow wallet, anonumous recipient.";
            recipientDuty = "Unclassified, <a href='utilities.html'>contact recipient</a>";
            recipientLevel = 6;
          }else{
            var recipient = myAddressBookObj[n].name;
            var recipientLevel = myAddressBookObj[n].level;
            var recipientDuty = myAddressBookObj[n].duty;
          };
        if(recipientLevel==5){
          $("#test-q6-yes").html("");
          $("#test-q6-no").html("&#x2714;");
          $("#advisoryA6").removeClass("d-none");
        }else if (recipientLevel==6) {
          $("#test-q8-yes").html("");
          $("#test-q8-no").html("&#x2714;");
          $("#advisoryA8").removeClass("d-none");
        }else if (recipientLevel==7) {
          $("#test-q4-yes").html("");
          $("#test-q4-no").html("&#x2716;");
          $("#test-q7-yes").html("");
          $("#test-q7-no").html("&#x2716;");
          $("#advisoryA4").removeClass("d-none");
        }else{
          $("#test-q6-yes").html("&#x2716;");
          $("#test-q6-no").html("");
          $("#test-q8-yes").html("&#x2716;");
          $("#test-q8-no").html("");
          $("#test-q5-yes").html("&#x2714;");
          $("#test-q5-no").html("");
        };
        var index = length-i;
        displayTbl='<table class="table word-break table-bordered table-sm fs-6 table-bordered caption-top">'+
                   '<caption>Transaction ' + index +'/'+length+' </caption>'+
                   '<tr><td class="td-1">&#x1F69A;recipient</td><td class="td-2">' + recipient +'</td></tr>'+
                   '<tr><td class="td-1">&#x1F69A;recipientRS</td><td class="td-2">' + recipientRS +'</td></tr>'+
                   '<tr><td class="td-1">&#x1F69A;Responsibility</td><td class="td-2">' + recipientDuty +'</td></tr>'+
                   '<tr><td class="td-1">&#x2708;sender</td><td class="td-2">' +sender +  '</td></tr>'+
                   '<tr><td class="td-1">&#x2708;senderRS</td><td class="td-2">' + senderRS +'</td></tr>'+
                   '<tr><td class="td-1">&#x2708;Responsibility</td><td class="td-2">' + senderDuty +'</td></tr>'+
                   '<tr><td class="td-1">Quantity</td><td class="td-2">' + qty + ' (quantityQNT: '+quantityQNT +', decimals: '+decimals+' )</td></tr>'+
                   '<tr><td class="td-1">Time</td><td class="td-2">' + localTime[0] +" "+ localTime[1]+ '</td></tr>';
                   // '<tr><td class="td-1">Full hash</td><td class="td-2">' + fullHash + '</td></tr></table>';
        $("#assetIssuerTbl").before(displayTbl);
      };
    };
  });
};

// asset transfers traceable ===================================================
function assetTransferTraceableFn(asset){
  $("#panelHistory").addClass("show");
  $("#btnHistory").removeClass("collapsed");
  $("#btnHistory").attr("aria-expanded","true");
  $.post(url,"requestType=getAssetTransfers&includeAssetInfo=true&asset="+asset,function(response){
    var assetTransferObj = JSON.parse(response);
    $("#JSONresponse").append("<h6>getAssetTransfers</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(assetTransferObj,undefined, 4)+"</textarea>");
    var length= assetTransferObj.transfers.length;
    if (length>0) {
      for(var i=0; i<length; i++){
        var senderRS    = assetTransferObj.transfers[i].senderRS;
        var recipientRS = assetTransferObj.transfers[i].recipientRS;
        var quantityQNT = assetTransferObj.transfers[i].quantityQNT;
        var decimals    = assetTransferObj.transfers[i].decimals;
        var timestamp   = assetTransferObj.transfers[i].timestamp;
        var fullHash    = assetTransferObj.transfers[i].assetTransferFullHash;
        var factor    = Math.pow(10, decimals);
        var qty       = quantityQNT/factor;
        var localTime = timestampToLocalFn(timestamp);
        var m = myAddressBookObj.map(function(e){return e.accountRS;}).indexOf(senderRS);
        if (m < 0){
          var sender = "Unknow wallet, anonumous sender.)";
          var senderDuty = "Unclassified, <a href='utilities.html'>contact sender</a>";
          senderLevel = 6;
        }else{
          var sender = myAddressBookObj[m].name;
          var senderLevel = myAddressBookObj[m].level;
          var senderDuty = myAddressBookObj[m].duty;
        };
          var n = myAddressBookObj.map(function(e){return e.accountRS;}).indexOf(recipientRS);
          if (n < 0){
            recipient = "Unknow wallet, anonumous recipient.";
            recipientDuty = "Unclassified, <a href='utilities.html'>contact recipient</a>";
            recipientLevel = 6;
          }else{
            var recipient = myAddressBookObj[n].name;
            var recipientLevel = myAddressBookObj[n].level;
            var recipientDuty = myAddressBookObj[n].duty;
          };
        var index = length-i;
        displayTbl='<table class="table word-break table-bordered table-sm fs-6 table-bordered caption-top">'+
                   '<caption>Transaction ' + index +'/'+length+' </caption>'+
                   '<tr><td class="td-1">&#x1F69A;recipient</td><td class="td-2">' + recipient +'</td></tr>'+
                   '<tr><td class="td-1">&#x1F69A;recipientRS</td><td class="td-2">' + recipientRS +'</td></tr>'+
                   '<tr><td class="td-1">&#x1F69A;Responsibility</td><td class="td-2">' + recipientDuty +'</td></tr>'+
                   '<tr><td class="td-1">&#x2708;sender</td><td class="td-2">' +sender +  '</td></tr>'+
                   '<tr><td class="td-1">&#x2708;senderRS</td><td class="td-2">' + senderRS +'</td></tr>'+
                   '<tr><td class="td-1">&#x2708;Responsibility</td><td class="td-2">' + senderDuty +'</td></tr>'+
                   '<tr><td class="td-1">Quantity</td><td class="td-2">' + qty + ' (quantityQNT: '+quantityQNT +', decimals: '+decimals+' )</td></tr>'+
                   '<tr><td class="td-1">Time</td><td class="td-2">' + localTime[0] +" "+ localTime[1]+ '</td></tr>'+
                   '<tr><td class="td-1">Full hash</td><td class="td-2">' + fullHash + '</td></tr></table>';
        $("#assetIssuerTbl").before(displayTbl);
      };
    };
  });
};

// 授权信息 with data/myAddressBook.json=========================================
function assetIssueDateFn(asset){
  $.post(url,"requestType=getAssetHistory&includeAssetInfo=true&asset="+asset,function(response){
    var assetHistoryObj = JSON.parse(response);
    console.log(assetHistoryObj);
    $("#JSONresponse").append("<h6>getAssetHistory</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(assetHistoryObj,undefined, 4)+"</textarea>");
    var i = assetHistoryObj.assetHistory.length -1;    //index of asset issuance
    var issuerRS          = assetHistoryObj.assetHistory[i].accountRS;
    var decimals          = assetHistoryObj.assetHistory[i].decimals
    var quantityQNT       = assetHistoryObj.assetHistory[i].quantityQNT;
    // var issuanceFullHash  = assetHistoryObj.assetHistory[i].assetHistoryFullHash;
    var issuanceTimes     = timestampToLocalFn(assetHistoryObj.assetHistory[i].timestamp);
    var issuanceEpoch     = epochBeginning + assetHistoryObj.assetHistory[i].timestamp;
    var factor = Math.pow(10, decimals);
    var issuedQuantity = quantityQNT/factor;

    var m = myAddressBookObj.map(function(e){return e.accountRS;}).indexOf(issuerRS);
    if (m>= 0){
      var name    = myAddressBookObj[m].name;
      var address = myAddressBookObj[m].address;
      var contact = myAddressBookObj[m].contact;
      var level   = myAddressBookObj[m].level;
      var duty    = myAddressBookObj[m].duty;
      var walletExpDate = expDateDisplayFn(myAddressBookObj[m].expDate);
      var walletExpEpoch = isoToEpochFn(myAddressBookObj[m].expDate);
      if(issuanceEpoch >walletExpEpoch){
        $("#test-q3-yes").html("");
        $("#test-q3-no").html("&#x2716;");
      };
      $("#test-q2-yes").html("&#x2714;");
      $("#test-q2-no").html("");
      $("#issuerInfoTbl-r1d2").html(name);
      $(".yourCompanyName").html(name);
      $("#issuerInfoTbl-r2d2").html(issuerRS);
      $("#issuerInfoTbl-r3d2").html(address);
      $("#issuerInfoTbl-r4d2").html("<a href='"+contact+"'>Offcial website</a>");
      $("#issuerInfoTbl-r5d2").html(walletExpDate[0]+" "+walletExpDate[1]+" , expired in "+walletExpDate[2]+" days");
      $("#assetIssuerTbl-issuer").html(name);
      $("#assetIssuerTbl-issuerRS").html(issuerRS);
      $("#assetIssuerTbl-duty").html(duty);
      $("#assetIssuerTbl-qty").html(issuedQuantity);
      $("#assetIssuerTbl-date").html(issuanceTimes[0]+" "+ issuanceTimes[1]);
      // $("#assetIssuerTbl-fullhash").html(issuanceFullHash);
      // $("#assetInforTbl-fullHash").html(issuanceFullHash);
      $("#assetInforTbl-issueDate").html(issuanceTimes[0] + ' '+issuanceTimes[1]+', '+ issuanceTimes[2]+' days');
      $("#assetInforTbl-qty").html(quantityQNT);
    }else{
      $("#test-q3").hide();
      $("#test-q4").hide();
      $("#advisoryA2").removeClass("d-none");
    };
  });
};

// 时间换算 ISO DATE TIME to Epoch =============================================
function isoToEpochFn(isoDateTime){
  var isoDT=new Date(isoDateTime);
  var isoToEpoch=isoDT.getTime()/1000;
  return isoToEpoch;
};

// timestampToEpochFn ==========================================================
// function timestampToEpochFn(timestamp){
//   var testnetEpochBeginning=1514275199, mainnetEpochBeginning=1514764800;
//   if(isNet=="mainnet"){
//     var timestampToEpoch = timestamp + mainnetEpochBeginning;
//   }else{
//     var timestampToEpoch = timestamp + testnetEpochBeginning;
//   };
//   return timestampToEpoch;
// };

// 时间换算 ISO DATE TIME 换算显示成当地时间 =====================================
  function expDateDisplayFn(isoDateTime){
    var isoDT=new Date(isoDateTime);
    var d =new Date();
    var daysAway = Math.floor((isoDT-d.getTime())/(1000*60*60*24));
    var year = isoDT.getFullYear();
    var month =1+ isoDT.getMonth();
    var day = isoDT.getDate();
    var date = year+"-"+month+"-"+day;
    var time = "23:59:59";
    var displayLocalTime = [date, time, daysAway];
    return displayLocalTime;
  };

// product information with data/myAssetBook.json ==============================
function assetInfoFn(name,asset){
  var letters = /^[0-9a-vA-V]+$/;
  if (name.match(letters)){
    var barcode=parseInt(name, 32).toString(10);
    var image1="images/products/"+barcode+"-1.jpg";
    var image2="images/products/"+barcode+"-2.jpg";
    var image3="images/products/"+barcode+"-3.jpg";
    $("#slideshow-1").attr("src", image1);
    $("#slideshow-2").attr("src", image2);
    $("#slideshow-3").attr("src", image3);
  }else{
    var barcode=name;
  };
    var n = myAssetBookObj.map(function(e){return e.barcode;}).indexOf(barcode);
    if (n>=0){
      var brand       = myAssetBookObj[n].brand;
      var model       = myAssetBookObj[n].model;
      var description = myAssetBookObj[n].description;
      var unit        = myAssetBookObj[n].unit;
      var madeIn      = myAssetBookObj[n].madeIn;
      var link        = myAssetBookObj[n].link;
      var goodFor     = myAssetBookObj[n].goodFor;
      $("#assetInforTbl-model").html("<a  href='"+link+"'>"+brand+"&nbsp;"+model+"</a>");
      $("#assetInforTbl-barcode").html(barcode);
      $("#assetInforTbl-description").html(description);
      $("#assetInforTbl-unit").html(unit);
      $("#assetInforTbl-madeIn").html(madeIn);
      $("#assetInforTbl-goodFor").html(goodFor);
    };
};

//generate fielToken and prepare NFT ==========================================
function genFileTokenFn(formData){
  var genFileTokenXhr = new XMLHttpRequest();
  var formDataMod = new FormData(formData);
  genFileTokenXhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var genFileTokenXhrObj=JSON.parse(genFileTokenXhr.responseText);
      var input = document.querySelector('#genFileTokenFormFile');
      if (input.files[0]){
        var file = input.files[0];
        var fileName = file.name;
        var lastModified=timestampToLocalFn(file.lastModified/1000-epochBeginning);
        var fileSize = returnFileSizeFn(file.size);
      };
      var secEpoch = Math.floor( Date.now() / 1000 );
      var txtFileName =fileName+'_'+secEpoch+'.txt';
      var fileToken = genFileTokenXhrObj.token;
      var accountRS = genFileTokenXhrObj.accountRS;
      var timestamp = genFileTokenXhrObj.timestamp;
      var secEpoch = epochBeginning + timestamp;
      var txtFileName =fileName+'_'+secEpoch+'.txt';
      var localTime = timestampToLocalFn(timestamp);
      var description = fileToken;
      var message = fileName+", "+fileSize+", "+lastModified[0]+" "+lastModified[1];
      var displayResult = "<p><b>Transaction: </b><br>FileToken was generated on "+localTime[0]+" , "+localTime[1]+", by Account " + accountRS+".</p>"+
                          "<p><b>About the file: </b><br> File name: " + fileName+"<br>File size: "+fileSize+"<br>last modified on: "+lastModified[0]+" , "+lastModified[1]+".</p>"+
                          "<p><b>fileToken: </b>" + fileToken+" </p>";
      $("#save2txt").attr("download",txtFileName);
      $("#genFileTokenDisplay").removeClass("d-none");
      $("#genFileTokenResult").html(displayResult);
      $("#decFileTokenFormToken").val(fileToken);
      $("#tokenizeFormDescription").val(description);
      $("#tokenizeFormMessage").val(message);
      $("#evidenceJSONBtn").removeClass("collapsed");
      $("#evidenceJSONPanel").addClass("show");
      $("#genFileTokenJSON").html("<h6>generateFileToken</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(genFileTokenXhrObj,undefined, 4)+"</textarea>");
      $("#save2txt").click(function(){
        this.href = "data:text/plain;charset=UTF-8,"  + encodeURIComponent(fileToken);
      });
    }
  };
  genFileTokenXhr.open("POST",url, true);
  genFileTokenXhr.send(formDataMod);
  return false;
};

//tokenize fielToken ===========================================================
$("#tokenizeForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  // console.log(formData);
  var tokenizeData  = [
    {name:"requestType",      value:"issueAsset"},
    // {name:"chain",            value:"2"},
    {name:"name",             value:formData[0].value},
    {name:"description",      value:formData[1].value},
    {name:"quantityQNT",      value:"1"},
    {name:"decimals",         value:"0"},
    {name:"secretPhrase",     value:formData[4].value},
    {name:"feeNQT",           value:"0"},
    {name:"deadline",         value:"60"},
    // {name:"feeRateNQTPerFXT", value:"-1"},
    {name:"broadcast",        value:"false"},
    {name:"message",          value:'License type: '+formData[3].value +"<br>File detail:  " +formData[2].value}
  ];
  $.ajax({
    type:"POST",
    url: url,
    data:tokenizeData,
    success:function(response){
      var responseObj = JSON.parse(response);
      // console.log(responseObj);
      if (responseObj.errorCode == 6){
        alert("账户内余额不足，不能生成NFT！");
      }else {
        var feeCC14 = responseObj.transactionJSON.feeNQT/100000000;
        var transactionBytes = responseObj.transactionBytes;
        var senderRS = responseObj.transactionJSON.senderRS;
        var timestamp = responseObj.transactionJSON.timestamp;
        var localTime = timestampToLocalFn(timestamp);
        var fielToken = responseObj.transactionJSON.attachment.description;
        var message = responseObj.transactionJSON.attachment.message;
        var name = responseObj.transactionJSON.attachment.name;
        var fullHash = responseObj.transactionJSON.fullHash;
        var assetID = NRS.fullHashToId(fullHash);
        $("#tokenizeDisplay").removeClass("d-none");
        $("#tokenizeTblAccountRS").html(senderRS);
        $("#tokenizeTblTime").html(localTime[0] + "," + localTime[1]);
        $("#tokenizeTblAssetID").html(assetID);
        $("#tokenizeTblFee").html(feeCC14+" CC14");
        $("#tokenizeTblFullHash").html(fullHash);
        $("#tokenizeTblFielToken").html(fielToken);
        $("#tokenizeTblFile").html(message);
        $("#tokenizeBroadcastTransactionBytes").val(transactionBytes);
        $("#tokenizeJSON").html("<h6>issueAsset</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
      }
    }
  });
});

//generateToken ================================================================
$("#genTokenForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  $.ajax({
    type:"POST",
    url: url,
    data:formData,
    success:function(response){
      var responseObj = JSON.parse(response);
      var token = responseObj.token;
      var accountRS = responseObj.accountRS;
      var timestamp = responseObj.timestamp;
      var localTime = timestampToLocalFn(timestamp);
      var result = "<span>Zero cost message token created on " + localTime[0] + " , " + localTime[1] + " by account " + accountRS + " . Transaction fullHash： <br> "+token;
      $("#evidenceJSONBtn").removeClass("collapsed");
      $("#evidenceJSONPanel").addClass("show");
      $("#genTokenDisplay").removeClass("d-none");
      $("#genTokenResult").html(result);
      $("#decTokenFormWebsite").val(formData[1].value);
      $("#decTokenFormToken").val(token);
      $("#genTokenJSON").html("<h6>generateToken</h6><textarea class='form-control border border-info' rows='10'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
});

//decodeToken
$("#decTokenForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  $.ajax({
    type:"POST",
    url: url,
    data:formData,
    success:function(response){
      var responseObj = JSON.parse(response);
      var valid = responseObj.valid;
      var accountRS = responseObj.accountRS;
      var timestamp = responseObj.timestamp;
      var localTime = timestampToLocalFn(timestamp);
      if (valid==true){
        var displayResult = "<b>Valid! </b><br>Message token was created by account " + accountRS +" on " + localTime[0] + " at " + localTime[1] + " .";
      }else {
        var displayResult = "<b>Invalid! </b><br>Message token was created by account " + accountRS +" on " + localTime[0] + " at " + localTime[1] + " .";
      };
      $("#decTokenDisplay").removeClass("d-none");
      $("#decTokenResult").html(displayResult);
      $("#decTokenJSON").html("<h6>decodeToken</h6><textarea class='form-control border border-info' rows='6'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
});

//passphraseEx
$("#passphraseExForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  $.ajax({
    type:"POST",
    url: url,
    data:formData,
    success:function(response){
      var responseObj = JSON.parse(response);
      var accountRS = responseObj.accountRS;
      var result = "Wallet address: " + accountRS;
      $("#passphraseExResult").html(result);
      $("#passphraseExJSON").html("<h6>generateToken</h6><textarea class='form-control border border-info' rows='6'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
});

$("#passphraseEx2Form").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  $.ajax({
    type:"POST",
    url: url,
    data:formData,
    success:function(response){
      var responseObj = JSON.parse(response);
      console.log(response);
      var accountRS = responseObj.accountRS;
      var result = "Wallet address: " + accountRS;
      $("#passphraseEx2Result").html(result);
      $("#passphraseEx2JSON").html("<h6>generateToken</h6><textarea class='form-control border border-info' rows='6'>" + JSON.stringify(responseObj,undefined, 4)+"</textarea>");
    }
  });
});

//splitSecret ==================================================================
$("#splitSecretForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  $.ajax({
    type:"POST",
    url: url,
    data:formData,
    success:function(response){
      var responseObj = JSON.parse(response);
      var length = responseObj.pieces.length;
      for (var i=0; i<length; i++){
        $("#splitSecretResult").append(responseObj.pieces[i]+"<br>");
      };
      $("#combineSecretForm0").val(responseObj.pieces[0]);
      $("#combineSecretForm1").val(responseObj.pieces[2]);
      $("#combineSecretForm2").val(responseObj.pieces[4]);
      $("#splitSecretResult").append("<hr style='color:red;border-top: 1px solid red'>");
      $("#splitSecretResult").append("Enter any three of above pieces");
    }
  });
});

//splitSecret ==================================================================
$("#combineSecretForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  console.log(formData);
  $.ajax({
    type:"POST",
    url: url,
    data:formData,
    success:function(response){
      var responseObj = JSON.parse(response);
      console.log(responseObj.secret);
      $("#combineSecretResult").append(responseObj.secret);
    }
  });
});

$("#aesKeyIvForm").submit(function(event){
  event.preventDefault();
  function getRandomIntInclusive() {
    min = Math.ceil(1000000000000000);
    max = Math.floor(9999999999999999);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  };

  var keyStr = getRandomIntInclusive();
  var ivStr = getRandomIntInclusive();
  console.log("ivStr: " + ivStr);
  console.log("keyStr: " + keyStr);
  dualQRcodeFn(keyStr,ivStr);
});

//AES key and iv qrCode generator==============================================
function dualQRcodeFn(keyStr,ivStr){
  var configKey = {
    width: 240,
    height: 240,
    text:keyStr,
    PI:"#00A1DB",
    quietZone: 25,
    logo:"images/logo-cc14-qr.png",
    logoWidth:100,
    logoHeight:50,
    title:"key",
    subTitle:keyStr,
    titleHeight:50,
    titleTop:20,
    subTitleTop: 40,
    correctLevel: QRCode.CorrectLevel.H
    };
  var t=new QRCode(document.getElementById("dispKeyIvQRCode"), configKey);
  var configIv=configKey;
  configIv.text=ivStr;
  configIv.title="iv";
  configIv.subTitle=ivStr;
  var s=new QRCode(document.getElementById("dispKeyIvQRCode"), configIv);
};

$("#reproduceRegCodeForm").submit(function(event){
  event.preventDefault();
  var formData = $(this).serializeArray();
  console.log(formData);
  var secureCode=formData[0].value;
  var regCode = encryptAESFn(secureCode, keyAES, ivAES);
  console.log(secureCode);
  console.log(regCode);
  $("#dispReproduceRegCode").html(regCode);
  issueNFTQRCodeFn(secureCode,regCode);
});

$("#apiUrlForm").submit(function(event){
  event.preventDefault();
  localStorage.clear();
  var formData = $(this).serializeArray();
  localStorage.setItem("apiUrl", formData[0].value);
});
