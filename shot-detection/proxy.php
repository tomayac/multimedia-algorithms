<?php  
  ini_set('memory_limit', '-1');
  set_time_limit(0);  

  // Core bits stolen from http://stackoverflow.com/questions/206059/php-validation-regex-for-url  
  $urlRegExp = "#((http|https|ftp)://(\S*?\.\S*?))(\s|\;|\)|\]|\[|\{|\}|,|\"|'|:|\<|$|\.\s)#ie";
      
  if (preg_match($urlRegExp, $_GET['video'])) {
    $json = array(array('url' => $_GET['video'], 'type' => ''));
    $chars = "abcdefghijkmnopqrstuvwxyz023456789"; 
    srand((double)microtime()*1000000); 
    $i = 0; 
    $videoId = ''; 
    while ($i < 7) { 
      $num = rand() % 33; 
      $tmp = substr($chars, $num, 1); 
      $videoId = $videoId . $tmp; 
      $i++; 
    } 
  } else {
    $dontPrintOutput = true;
    require_once('getVideoInfo.php');
    $json = json_decode($json, true);    
  }

  $url = $json[0]['url'];
  $type = $json[0]['type'];

  if (!$url) {  
    // Passed url not specified.
    exit('ERROR: url not specified');
  
  } else {    
    $ch = curl_init($url);
    
    $filename = './videos/' . $videoId . '.mp4';
    $handle = fopen($filename, 'w');
    if (!$handle) {
      exit('Could not open file ' . $filename);
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch, CURLOPT_FILE, $handle);      
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HEADER, false);    
    curl_setopt($ch, CURLINFO_HEADER_OUT, true);    
    $headerArray = array(
        "Referer: http://tomayac.no.de/video/aUB8l5H4ddA",	
        "Connection: keep-alive",
        "Cache-Control: max-age=0",
        "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.803.0 Safari/535.1",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding: gzip,deflate,sdch",
        "Accept-Language: en-US,en;q=0.8,fr-FR;q=0.6,fr;q=0.4,de;q=0.2,de-DE;q=0.2,es;q=0.2,ca;q=0.2",
        "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3",        
        "If-Modified-Since: Thu, 04 Nov 2010 05:35:38 GMT");	
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headerArray);        
    $data = curl_exec($ch);

    fclose($handle);
    echo '[{"url": "http://tomayac.com/youpr0n/' . $filename . '","type": "' . str_replace('"', '\"', $type) . '"}]';
  }
?>