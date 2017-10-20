<?php
  session_start();
  
  /*require __DIR__ . '/vendor/autoload.php';
  $dotenv = new Dotenv\Dotenv(__DIR__);
  $dotenv->load();*/
  
  header('Content-type: application/json');
  $email = "felipecejug@gmail.com";
  $password = "xxxabc123";
  $serviceId = 438;
  $url = 'https://login.globo.com/api/authentication';
  $jsonAuth = array(
    'payload' => array(
      'email' => $email,
      'password' => $password,
      'serviceId' => $serviceId
    )
  );
  $c = curl_init();
  curl_setopt($c, CURLOPT_URL, $url);
  curl_setopt($c, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
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
