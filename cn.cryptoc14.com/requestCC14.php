<?php
  $url = "http://40.124.110.187:19886/nxt";
  $distributorSecretPhrase = "flirt despite melody wall amaze lunch dude total trust defeat steady awkward 2!oo6";
  $distributorRS = "CC14-XBNL-PLAT-UDME-EGAXX";

  $requestorRS = $_POST["account"];
  $requestorPubKey = $_POST["publicKey"];
  $cc14Received = 0;
  $unconfirmedDistribution = false;

  // get sendMoney transaction , type 0 subtypt0, find out totla CC14 received from distributor
  $requestOne = array(
      'requestType' => 'getBlockchainTransactions',
      'account' => $requestorRS,
      'type' => '0',
      'subtype' => '0',
    );
  $cURLrequestOne = curl_init($url);
  curl_setopt($cURLrequestOne, CURLOPT_POSTFIELDS, $requestOne);
  curl_setopt($cURLrequestOne, CURLOPT_RETURNTRANSFER, true);
  $requestOneResponse = curl_exec($cURLrequestOne);
  curl_close($cURLrequestOne);
  $requestOneResponseArr = json_decode($requestOneResponse);
  for ($i=0; $i<count($requestOneResponseArr->transactions);$i++){
      if ($requestOneResponseArr->transactions[$i]->senderRS == $distributorRS){
          $cc14Received = $cc14Received + $requestOneResponseArr->transactions[$i]->amountNQT/100000000;
      }
  };

  // check if  there is unfonfirmedTransaction, assume the transcation is from the distributor it is type 0 subtype 0
  $requestTwo = array(
    'requestType' => 'getUnconfirmedTransactions',
    'account' => $requestorRS,
  );
  $cURLrequestTwo = curl_init($url);
  curl_setopt($cURLrequestTwo, CURLOPT_POSTFIELDS, $requestTwo);
  curl_setopt($cURLrequestTwo, CURLOPT_RETURNTRANSFER, true);
  $requestTwoResponse = curl_exec($cURLrequestTwo);
  curl_close($cURLrequestTwo);
  $requestTwoResponseArr = json_decode($requestTwoResponse);
  if ($requestTwoResponseArr->unconfirmedTransactions != null){
      $unconfirmedDistribution = true;
      echo '{"request":"rejected", "responses":"Unconfirmed transactions found. Please wait 60 seconds then reload the page and retry."}';
  }else{
    if ($cc14Received<2000 && $unconfirmedDistribution ==false){
      $sendMoney = array(
        'requestType' => 'sendMoney',
        'recipient' => $requestorRS,
        'amountNQT' => 50000000000,
        'secretPhrase' => $distributorSecretPhrase,
        'publicKey' => $requestorPubKey,
        'feeNQT' => '0',
        'deadline' => '60',
        'broadcast' => 'true',
        );
      $cURLsendMoney = curl_init($url);
      curl_setopt($cURLsendMoney, CURLOPT_POSTFIELDS, $sendMoney);
      curl_setopt($cURLsendMoney, CURLOPT_RETURNTRANSFER, true);
      $apiResponse = curl_exec($cURLsendMoney);
      curl_close($cURLsendMoney);
      echo $apiResponse;
    }else{
      echo '{"request":"rejected", "responses":"Requesting account received ' . $cc14Received . ' CC14 from CryptoC14 blockchain coin distributor. Please contact WeChat_ID:fengyun_houston for additional amount."}';
    };
  };




?>
