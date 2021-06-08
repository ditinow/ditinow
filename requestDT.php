  <?php
  $mySecretPhrase = "dreamer cruel swallow mean pray judge hang shown concrete chin scale void";
  $key            = 4637379464008381;
  $iv             = 6394680564231843;
  $mes = hex2bin($_POST["regCode"]);
  $res = openssl_decrypt($mes, 'AES-128-CBC', $key, OPENSSL_RAW_DATA,$iv);
  if($res==""){
    echo '{"fullHash":"failed"}';
  }else if($res != $_POST["asset"]){
    echo '{"fullHash":"mismatch","decrypted":"'.$res.'"}';
  }else if($res == $_POST["asset"]){
    $postRequest = array(
        'requestType' => 'transferAsset',
        'chain' => '2',
        'recipient' => $_POST["recipient"],
        'asset' => $_POST["asset"],
        'quantityQNT' => '1',
        'secretPhrase' => $mySecretPhrase,
        'feeNQT' => '-1',
        'feeRateNQTPerFXT' => '-1',
        'broadcast' => 'false',
        'messageIsPrunable' => 'true',
        'message' => $_POST["regCode"]
    );
    $cURLConnection = curl_init('https://testardor.jelurida.com/nxt');
    curl_setopt($cURLConnection, CURLOPT_POSTFIELDS, $postRequest);
    curl_setopt($cURLConnection, CURLOPT_RETURNTRANSFER, true);
    $apiResponse = curl_exec($cURLConnection);
    curl_close($cURLConnection);
    echo $apiResponse;
  };
  ?>
