(function() {
  
  var GLOBAL_config = {
    proxy: 'http://tomayac.com',
    spinner: 'data:image/gif;base64,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'
  };
  
  var interval = setInterval(function () {
    var videoElement =
        document.querySelector('embed') || document.querySelector('video');
    if (videoElement === null) {      
      return;
    } else {
      clearInterval(interval);
    }    
    var videoId = window.location.getParameter('v');
    if (videoId) {  
      var url = 'http://www.youtube.com/get_video_info?video_id=' + videoId +
          '&html5=1&eurl=unknown&el=embedded&hl=en_US';
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function(e) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var videoData = parseVideoData(xhr.responseText);
            if (!videoData) {
              throw 'Could not embed video.';
            }
            var placeholder = document.createElement('div');
            placeholder.id = 'placeholder';
            var placeholderStyle = placeholder.style;
            placeholderStyle.width = videoElement.width + 'px';
            placeholderStyle.height = videoElement.height + 'px', 
            placeholderStyle.backgroundImage =
                'url(' + GLOBAL_config.spinner + ')';
            placeholderStyle.backgroundRepeat = 'no-repeat';
            placeholderStyle.backgroundPosition = 'center center';
            var videoContainer = videoElement.parentNode;        
            if (videoContainer.nodeName.toLowerCase() !== 'div') {
              throw 'No video or embed container found.';
            }    
            videoContainer.style.height =
                (parseInt(videoElement.height, 10) + 220) + 'px';
            videoContainer.replaceChild(placeholder, videoElement);                    
            replaceVideoElement(
                placeholder, videoContainer, videoData, videoId);
          } else {
            throw 'Could not get video metadata.'
          }
        }        
      }
      xhr.open("GET", url, true);
      xhr.send();
    } else {
      throw 'No video ID found.';
    }    
  }, 100);     
  
  function parseVideoData(videoInfo) {
    var parts = videoInfo.split(/&/);
    for (var i = 0, len = parts.length; i < len; i++) {
      var part = parts[i];
      var keyValues = part.split(/=/);
      if (keyValues[0] === 'html5_fmt_map') {
        videoInfo = decodeURIComponent(keyValues[1]).replace(/\+/g, ' ');
        videoInfo = videoInfo.replace(/^\[/, '').replace(/\]$/, '');
        break;
      }
    }
    parts = videoInfo.split(/\},/);
    var json = '[{';
    for (var i = 0, len1 = parts.length; i < len1; i++) {
      if (i < len1 - 1) {
        parts[i] += '}';
      }
      var part = parts[i].replace(/^\{/, '').replace(/\}$/, '');
      var keyValues = part.split(/'\,/);
      for (var j = 0, len2 = keyValues.length; j < len2; j++) {        
        var keyValue = keyValues[j].split(/':/);
        json += j > 0? ',' : '';
        json += keyValue[0].replace(/\s*'/g, '"') + '":' +
            keyValue[1].replace(/^\s*'/, '"').replace(/="/g, '=\\"')
            .replace(/"$/g, '\\"');
        json += keyValue[0] !== ' \'itag'? '"' : '';
      }
      json += i < len1 - 1? '},' : '}';
    }
    json += ']';
    return JSON.parse(json);
  }
    
  function replaceVideoElement(
      placeholder, videoContainer, videoData, videoId) {
    var video = document.createElement('video');
    video.controls = 'controls';
    for (var i = 0, len = videoData.length; i < len; i++) {
      var source = document.createElement('source');
      source.src = videoData[i].url;
      if (videoData[i].type) {
        source.type = videoData[i].type
      }
      video.appendChild(source);
    }
    video.width = placeholder.style.width.replace('px', '');
    video.height = placeholder.style.height.replace('px', '');
    videoContainer.replaceChild(video, placeholder);    
    video.load();
    video.addEventListener('canplaythrough', function(e) {
      video.play();
    }, false);        

    var progress = document.createElement('progress');
    progress.max = 100;
    placeholder.style.height = '100px !important';
    var h1 = document.createElement('h1');
    h1.innerHTML = 'Analyzing Video...';
    videoContainer.appendChild(placeholder);
    videoContainer.appendChild(h1);
    videoContainer.appendChild(progress);        
    window.addEventListener('message', function(e) {
      if (e.origin !== GLOBAL_config.proxy) {
        return;
      }
      var data = e.data.progress;
      if (data === 100) {
        progress.parentNode.removeChild(progress);
        h1.parentNode.removeChild(h1);
        placeholder.parentNode.removeChild(placeholder);
        iframe.style.display = 'block';      
      } else {
        progress.value = data;
      }      
    }, false);
    
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    var iframeStyle = iframe.style;
    iframeStyle.width = '640px !important';    
    iframeStyle.height = '200px !important';
    iframeStyle.border = 'solid #313131 1px';
    iframe.src = 'http://tomayac.com/youpr0n/youtube.html?v=' + videoId;
    videoContainer.appendChild(iframe);
  }  
})();