<?php
  session_start();
  
  header('Content-type: application/json');
  
  $email = "felipecejug@gmail.com";
  $password = "xxx123abc";
  $serviceId = 4728;
  $url = 'https://login.globo.com/api/authentication';
  $jsonAuth = array(
    'captcha' => '',
      'payload' => array(
      'email' => $email,
      'password' => $password,
      'serviceId' => $serviceId
    )
  );
  
  $c = curl_init();
  curl_setopt($c, CURLOPT_URL, $url);
  curl_setopt($c, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
  curl_setopt($c, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; rv:53.0) Gecko/20100101 Firefox/53.0");
  curl_setopt($c, CURLOPT_POST, true);
  curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($jsonAuth));
  
  $result = curl_exec($c);
  if ($result === FALSE) {
    die(curl_error($c));
  }
  
  curl_close($c);
  
  $parseJson = json_decode($result, TRUE);
  $_SESSION['glbId'] = $parseJson['glbId'];
?>
