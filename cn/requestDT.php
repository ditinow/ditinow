<?php
$url = "http://40.124.110.187:19886/nxt";
$mySecretPhrase = "ci di wu yin 302 liang ge bi wang er bu ceng tou";
$key            = 5399631576047603;
$iv             = 9958509500228432;

$mes        = hex2bin($_POST["regCode"]);
$asset      = $_POST["asset"];
$recipient  = $_POST["recipient"];
$publicKey  = $_POST["publicKey"];

$res = openssl_decrypt($mes, 'AES-128-CBC', $key, OPENSSL_RAW_DATA,$iv);
if($res==""){
  echo '{"fullHash":"failed"}';
}else if($res != $asset){
  echo '{"fullHash":"mismatch","decrypted":"'.$res.'"}';
}else if($res == $asset){
  $postRequest = array(
      'requestType'   => 'transferAsset',
      'recipient'     => $recipient,
      'publicKey'     => $publicKey,
      'asset'         => $asset,
      'quantityQNT'   => '1',
      'secretPhrase'  => $mySecretPhrase,
      'feeNQT'        => '0',
      'deadline'      => '60',
      'broadcast'     => 'false',
  );
  $cURLConnection = curl_init($url);
  curl_setopt($cURLConnection, CURLOPT_POSTFIELDS, $postRequest);
  curl_setopt($cURLConnection, CURLOPT_RETURNTRANSFER, true);
  $apiResponse = curl_exec($cURLConnection);
  curl_close($cURLConnection);
  echo $apiResponse;
};
?>
