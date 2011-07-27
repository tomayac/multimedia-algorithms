(function() {
  
  var GLOBAL_config = {
    proxy: 'http://tomayac.com',
    youtube: 'http://www.youtube.com',
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
            placeholderStyle.backgroundColor = 'white !important';
            placeholderStyle.textalign = 'center !important';
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
            videoContainer.style.backgroundColor = 'white !important';
            videoContainer.style.height =
                (parseInt(videoElement.height, 10) + 220) + 'px !important';
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
        
    // formats the time in a readable way
    //
    // Core bits adapted (stolen) from
    // http://isithackday.com/videograbber/
    function formatTime(time) {
      var hours = parseInt((time / 60 / 60) % 60, 10);
      var mins = parseInt((time / 60) % 60, 10);
      var secs = parseInt(time, 10) % 60;
      var hourss = (hours < 10 ? '0' : '') + parseInt(hours, 10) + ':';
      var minss = (mins < 10 ? '0' : '') + parseInt(mins, 10) + ':';
      var secss  = (secs < 10 ? '0' : '') +(secs % 60);
      var timestring = ( hourss !== '00:' ? hourss : '' ) + minss + secss;
      return timestring;
    }          
            
    var video = document.createElement('video');
    video.id = 'GLOBAL_video_id';
    video.controls = 'controls';
    for (var i = 0, len = videoData.length; i < len; i++) {
      var source = document.createElement('source');
      source.src = videoData[i].url;
      if (videoData[i].type) {
        source.type = videoData[i].type
      }
      video.appendChild(source);
    }
    //video.width = placeholder.style.width.replace('px', '');
    video.height = placeholder.style.height.replace('px', '');
    videoContainer.replaceChild(video, placeholder);        
    video.load();
    video.addEventListener('canplaythrough', function(e) {
      video.play();
    }, false);  

    var progress = document.createElement('progress');
    placeholder.appendChild(progress);            
    videoContainer.appendChild(placeholder);    
    var progressStyle = progress.style;
    progressStyle.position = 'relative';
    progressStyle.top = '70%';
    progressStyle.left =
        (~~(video.width / 2) - ~~(progress.offsetWidth / 2)) + 'px';
    progress.max = 100;
    placeholder.style.height = '150px !important';

    window.addEventListener('message', function(e) {
      if (e.origin !== GLOBAL_config.proxy) {
        return;
      }
      if (e.data.type === 'progress') {
        var data = e.data.progress;
        if (data === 100) {
          placeholder.parentNode.removeChild(placeholder);
          iframe.style.display = 'block';      
        } else {
          progress.value = data;
        }      
      } else if (e.data.type === 'jumpTo') {
        var data = e.data.jumpTo;
        video.currentTime = data;
        trackEvent('seek', videoId, data);        
        console.log('Seeking to ' + formatTime(data));
      }        
    }, false);

    // need the backreference to e.source (the iframe), as e.source is null when
    // postmessage is run from an extension context
    // (https://developer.mozilla.org/en/DOM/window.postMessage#Using_window.postMessage_in_extensions_Non-standard)
    // trick it by appending the script data manually (i.e. script runs not
    // from an extension context) and dynamically add the event listener 
    // timeupdate to the video with the e.source backreference retrieved before. 
    appendScript(
        "window.addEventListener('message', function (e) {\n" +
        "  if (e.origin !== '" + GLOBAL_config.proxy + "') {\n" +
        "    return;\n" +
        "  }\n" +
        "  if (e.data.type === 'getCurrentTime') {\n" +
        "    var currentTime = 0;\n" +
        "    var video = document.getElementById('GLOBAL_video_id');\n" +
        "    video.addEventListener('timeupdate', function (f) {\n" +
        "      var time = ~~(video.currentTime);\n" +
        "      if (time > currentTime) {\n" +
        "        currentTime = time;\n" +
        "        e.source.postMessage({\n" +
        "          currentTime: time,\n" +
        "          type: 'currentTime'\n" +
        "        }, e.origin);\n" +
        "      }\n" +
        "    }, false);\n" +
        "  }\n" +
        "}, false);\n");
            
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    var iframeStyle = iframe.style;
    iframeStyle.backgroundColor = 'white !important;';
    iframeStyle.width = '640px !important';    
    iframeStyle.height = '200px !important';
    iframeStyle.border = 'solid #313131 1px';
    var src = 'http://tomayac.com/youpr0n/youtube.html?v=' + videoId;
    iframe.src = src;
    videoContainer.appendChild(iframe);    
    
    addAnalyticsCode();           
  }
  
  function appendScript(code) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = code;  
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
    script.parentNode.removeChild(script);         
  }

  function addAnalyticsCode(screenName) {
    appendScript("var _gaq = _gaq || [];\n" +
        "_gaq.push(['filmstrip._setAccount', 'UA-2040927-12']);\n" +
        "_gaq.push(['filmstrip._setDomainName', 'none']);\n" +
        "_gaq.push(['filmstrip._setAllowLinker', true]);\n" +
        "_gaq.push(['filmstrip._trackPageview']);\n" +
        "(function() {\n" +
        "  var ga = document.createElement('script');\n" +
        "  ga.type = 'text/javascript';" +
        "  ga.async = true;\n" +
        "  ga.src = ('https:' == document.location.protocol ?\n" +
        "      'https://ssl' : 'http://www') + " +
        "      '.google-analytics.com/ga.js';\n" +
        "  var s = document.getElementsByTagName('script')[0];\n" +
        "  s.parentNode.insertBefore(ga, s);\n" +
        "})();\n");  
  }

  function trackEvent(category, action, label, value) {
    appendScript(
        "_gaq.push(['filmstrip._trackEvent', '" +
        category + "', '" +
        action + "', '" +
        label + "', " +
        value + "]);\n");
  }
  
    
})();
