<?php  
  $videoId = $_GET['video'];
  if (!$videoId) {
    exit('Invalid YouTube Video ID.');
  }

  $url = 'http://www.youtube.com/get_video_info?video_id=' . $videoId . '&html5=1&eurl=unknown&el=embedded&hl=en_US';
  $headers = array(
      'Accept: */*',
      'Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3',
      'Accept-Encoding: gzip,deflate,sdch',
      'Accept-Language: en-US,en;q=0.8,fr-FR;q=0.6,fr;q=0.4,de;q=0.2,de-DE;q=0.2,es;q=0.2,ca;q=0.2',
      'Connection: keep-alive',
      'Referer: http://www.youtube.com/embed/dP15zlyra3c?html5=1',
      'User-Agent: Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8B117 Safari/6531.22.7');

  // create a new cURL resource
  $ch = curl_init();

  // set URL and other appropriate options
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HEADER, false);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  curl_setopt($ch, CURLINFO_HEADER_OUT, true);    
  
  // grab URL and pass it to the browser
  $videoInfo = curl_exec($ch);
  
  //print_r(curl_getinfo($ch, CURLINFO_HEADER_OUT));
  
  if (!$videoInfo) {
    exit('Could not Retrieve YouTube Video Data.');
  }

  // close cURL resource, and free up system resources
  curl_close($ch);    
  
  $parts = explode('&', $videoInfo);
  for ($i = 0, $len = sizeOf($parts); $i < $len; $i++) {
    $part = $parts[$i];
    $keyValues = explode('=', $part);
    if ($keyValues[0] === 'status' && $keyValues[1] === 'fail') {
      $json = 'false';      
      if ($_GET['callback']) {        
        $json = $_GET['callback'] . '(' . $json . ')'; 
      }
      if (!$dontPrintOutput) {
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');      
        echo($json);
      }
      exit();
    }
    if ($keyValues[0] === 'url_encoded_fmt_stream_map') {
      $videoInfo = preg_split('/,/', urldecode($keyValues[1]));
      break;
    }
  }
  $json = '[';
  for ($i = 0, $len1 = sizeOf($videoInfo); $i < $len1; $i++) {
    $parts = preg_split('/&/', $videoInfo[$i]);
    $json .= $i > 0 ? ',{' : '{';
    for ($j = 0, $len2 = sizeOf($parts); $j < $len2; $j++) {
      $part = $parts[$j];
      $keyValues = preg_split('/=/', $part);
      $key = $keyValues[0];
      if ($key === 'itag' || $key === 'fallback_host') {
        continue;
      }
      $value = $keyValues[1];
      if ($key === 'url' || $key === 'type') {
        $value = urldecode($value);
      }
      if ($key === 'type') {
        $value = preg_replace('/"/', '\\"', $value);
      }
      $json .= ($j > 0 ? ',"' . $key . '"' : '"' . $key . '"') .
          ':"' . $value . '"'; 
    }
    $json .= '}';
  }
  $json .= ']';  
  if ($_GET['callback']) {
    $json = $_GET['callback'] . '(' . $json . ')'; 
  }
  if (!$dontPrintOutput) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');      
    echo($json);
  }
?>