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
    if ($keyValues[0] === 'html5_fmt_map') {
      $videoInfo = urldecode(str_replace('+', ' ', $keyValues[1]));
      $videoInfo = preg_replace('/\]$/', '', preg_replace('/^\[/', '', $videoInfo));
      break;
    }
  }
  $parts = preg_split('/\},/', $videoInfo);
  $json = '[{';
  for ($i = 0, $len1 = sizeOf($parts); $i < $len1; $i++) {
    if ($i < $len1 - 1) {
      $parts[$i] .= '}';
    }
    $part = preg_replace('/\}$/', '', preg_replace('/^\{/', '', $parts[$i]));
    $keyValues = preg_split('/\'\,/', $part);
    for ($j = 0, $len2 = sizeOf($keyValues); $j < $len2; $j++) {        
      $keyValue = preg_split('/\':/', $keyValues[$j]);
      $json .= $j > 0? ',' : '';
      $json .= preg_replace('/\s*\'/', '"', $keyValue[0]) . '":' .
          preg_replace('/"$/', '\\"', preg_replace('/="/', '=\\"', preg_replace('/^\s*\'/', '"', $keyValue[1])));
      $json .= $keyValue[0] !== ' \'itag'? '"' : '';
    }
    $json .= $i < $len1 - 1? '},' : '}';
  }
  $json .= ']';
  if (!$dontPrintOutput) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');      
    echo($json);
  }
?>