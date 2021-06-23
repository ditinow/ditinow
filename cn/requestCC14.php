<?php
    $url = "http://40.124.110.187:19886/nxt";
    $distributorSecretPhrase = "flirt despite melody wall amaze lunch dude total trust defeat steady awkward 2!oo6";
    $distributorRS = "CC14-XBNL-PLAT-UDME-EGAXX";
    $requestorRS = $_POST["account"];
    $requestorPubKey = $_POST["publicKey"];

    $requestOne = array(
        'requestType' => 'getUnconfirmedTransactions',
        'account'     => $requestorRS);

    $requestTwo = array(
        'requestType' => 'getBlockchainTransactions',
        'account'     => $requestorRS,
        'type'        => '0',
        'subtype'     => '0');

    $requestThree = array(
      'requestType'   => 'sendMoney',
      'recipient'     => $requestorRS,
      'amountNQT'     => 50000000000,
      'secretPhrase'  => $distributorSecretPhrase,
      'publicKey'     => $requestorPubKey,
      'feeNQT'        => '0',
      'deadline'      => '60',
      'broadcast'     => 'true');

    function curlFn($url, $requestNumber){
      $cURLrequest = curl_init($url);
      curl_setopt($cURLrequest, CURLOPT_POSTFIELDS, $requestNumber);
      curl_setopt($cURLrequest, CURLOPT_RETURNTRANSFER, true);
      $apiResponse = curl_exec($cURLrequest);
      curl_close($cURLrequest);
      return $apiResponse;
    };

    $unconfirmedTXresponse = json_decode(curlFn($url, $requestOne));
    if (property_exists($unconfirmedTXresponse,"errorDescription") == true){
        echo '{"request":"incorrectAccount"}';
    }else if($unconfirmedTXresponse->unconfirmedTransactions != null){
        echo '{"request":"unconfirmedTX"}';
    }else{
      $blockchainTXresponse  = json_decode(curlFn($url, $requestTwo));
      $cc14Received = 0;
      for ($i=0; $i<count($blockchainTXresponse->transactions);$i++){
        if ($blockchainTXresponse->transactions[$i]->senderRS == $distributorRS){
          $cc14Received = $cc14Received + $blockchainTXresponse->transactions[$i]->amountNQT/100000000;
        }
      };
      if ($cc14Received>1999){
        echo '{"request":"exceed"}';
      }else{
        echo curlFn($url, $requestThree);
      };
    };
?>
