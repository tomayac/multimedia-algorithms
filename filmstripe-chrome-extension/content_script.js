(function () {
  var GLOBAL_config = {
    proxy: 'http://tomayac.com',
    youtube: 'http://www.youtube.com',
    containerHeight: 220,
    controlsOffset: 20,
    analyticsId: 'UA-2040927-12',
    placeholderHeight: 150,
    watchSidebarOffset: -250    
  };
  
  var interval = setInterval(function () {
    var videoElement =
        document.querySelector('embed') || document.querySelector('video');
    if (videoElement === null) {      
      // keep trying
      return;
    }
    var videoContainer = videoElement.parentNode;        
    if (!videoContainer || videoContainer.nodeName !== 'DIV') {
      throw 'No video or embed container found.';
    }
    clearInterval(interval);    
    videoContainer.style.height =
        (parseInt(videoElement.height, 10) + GLOBAL_config.containerHeight) +
        'px !important';
    var videoId = window.location.getParameter('v');
    if (!videoId) {        
      throw 'No video ID found.';
    }      
    var url = GLOBAL_config.youtube + '/get_video_info?video_id=' + videoId +
        '&html5=1&eurl=unknown&el=embedded&hl=en_US';
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          var sources = parseVideoSources(xhr.responseText);
          if (!sources) {
            throw 'Could not embed video.';
          }            
          replaceVideoElement(videoContainer, videoElement, sources, videoId);
        } else {
          throw 'Could not get video metadata.'
        }
      }        
    }
    xhr.open("GET", url, true);
    xhr.send();
  }, 100);     
  
  function parseVideoSources(videoInfo) {
    var parts = videoInfo.split(/&/);
    for (var i = 0, len = parts.length; i < len; i++) {
      var part = parts[i];
      var keyValues = part.split(/=/);
      if (keyValues[0] === 'status' && keyValues[1] === 'fail') {
        var json = false;          
        return JSON.parse(json);        
      }
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
    var secss  = (secs < 10 ? '0' : '') + (secs % 60);
    var timestring = ( hourss !== '00:' ? hourss : '' ) + minss + secss;
    return timestring;
  }  
    
  function replaceVideoElement(videoContainer, videoElement, sources, videoId) {     
    var placeholder = document.createElement('div');
    placeholder.id = 'filmstrip_placeholder';
    placeholder.style.width = (videoElement.width - 2 /*border width*/) + 'px';
    placeholder.style.height = videoElement.height + 'px';     
    var nativeWidth = videoElement.width;
    var nativeHeight = videoElement.height;
    videoContainer.replaceChild(placeholder, videoElement);                    
            
    var video = document.createElement('video');
    video.id = 'filmstrip_video'
    video.width = nativeWidth;
    video.style.width = nativeWidth + 'px';
    video.height = nativeHeight;
    for (var i = 0, len = sources.length; i < len; i++) {
      var source = document.createElement('source');
      source.src = sources[i].url;
      if (sources[i].type) {
        source.type = sources[i].type
      }
      video.appendChild(source);
    }    
    videoContainer.replaceChild(video, placeholder);        
    video.load();
    
    var fullscreen = false;
    var fullScreenDiv = document.createElement('div');
    fullScreenDiv.id = 'filmstrip_fullscreen';
    fullScreenDiv.style.width = window.innerWidth + 'px';
    fullScreenDiv.style.height =
        (window.innerHeight - GLOBAL_config.controlsOffset) + 'px';          
    
    video.addEventListener('mousemove', function (e) {
      video.controls = 'controls';
    }, false);    
    
    video.addEventListener('mouseover', function (e) {
      video.controls = 'controls';      
    }, false);
    
    video.addEventListener('mouseout', function (e) {
      setTimeout(function () {
        video.removeAttribute('controls');              
      }, 500);      
    }, false);    
        
    video.addEventListener('canplaythrough', function(e) {
      video.play();
    }, false);  
    
    video.addEventListener('ended', function(e) {
      video.currentTime = 0;
      video.play();
    }, false);        
    
    video.addEventListener('click', function (e) {
      if (video.height - e.layerY <= GLOBAL_config.controlsOffset) {
        return;
      }
      var currentTime = video.currentTime;
      if (!fullscreen) {        
        fullscreen = true;
        document.body.appendChild(fullScreenDiv);
        document.body.style.overflow = 'hidden !important';
        video.width = window.innerWidth;
        video.style.width = window.innerWidth + 'px';
        video.height = window.innerHeight - GLOBAL_config.controlsOffset;
        videoContainer.removeChild(video);
        fullScreenDiv.appendChild(video);                
        video.addEventListener('loadedmetadata', function (e) {
          video.currentTime = currentTime;
        }, false);        
      } else {
        fullscreen = false;
        document.body.removeChild(fullScreenDiv);        
        document.body.style.overflow = 'auto !important';                
        video.width = nativeWidth;
        video.style.width = nativeWidth + 'px';
        video.height = nativeHeight;
        fullScreenDiv.removeChild(video);
        videoContainer.insertBefore(video, videoContainer.firstChild);        
        video.addEventListener('loadedmetadata', function (e) {
          video.currentTime = currentTime;
        }, false);        
      }  
    }, false);        

    videoContainer.appendChild(placeholder);    
    placeholder.style.height =
        GLOBAL_config.placeholderHeight + 'px !important';    
    placeholder.innerHTML = '<small id="filmstrip_progress">0%</small>';
    
    var iframe = document.createElement('iframe');    
    iframe.id = 'filmstrip_iframe';
    iframe.src = GLOBAL_config.proxy + '/youpr0n/youtube.html?v=' + videoId;
    videoContainer.appendChild(iframe);        

    var watchSidebar = document.getElementById('watch-sidebar');
    if (watchSidebar) {
      watchSidebar.style.position = 'relative !important';
      watchSidebar.style.top =
          GLOBAL_config.watchSidebarOffset + 'px !important';
    }

    // need the backreference to e.source (the iframe), as e.source is null when
    // postmessage is run from an extension context
    // (https://developer.mozilla.org/en/DOM/window.postMessage-
    // #Using_window.postMessage_in_extensions_Non-standard)
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
        "    var video = document.getElementById('filmstrip_video');\n" +
        "    video.addEventListener('ended', function (f) {\n" +
        "      currentTime = 0;\n" +
        "    }, false);\n" +        
        "    video.addEventListener('seeked', function (f) {\n" +
        "      currentTime = video.currentTime;\n" +
        "    }, false);\n" +        
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

    window.addEventListener('resize', function (e) {
      fullScreenDiv.style.width = window.innerWidth + 'px';
      fullScreenDiv.style.height =
          (window.innerHeight - GLOBAL_config.controlsOffset) + 'px';
      if (fullscreen) {
        video.width = window.innerWidth;
        video.style.width = window.innerWidth + 'px';
        video.height = window.innerHeight;              
      }
    }, false);    
    
    window.addEventListener('message', function(e) {
      if (e.origin !== GLOBAL_config.proxy) {
        return;
      }
      if (e.data.type === 'progress') {
        var data = e.data.progress;
        if (data === 100) {
          placeholder.parentNode.removeChild(placeholder);
          iframe.style.display = 'block !important';      
        } else {
          placeholder.innerHTML =
              '<small id="filmstrip_progress">' + data + '%</small>';
        }      
      } else if (e.data.type === 'jumpTo') {
        var data = e.data.jumpTo;
        video.currentTime = data;
        trackEvent('seek', videoId, data);        
      }        
    }, false);  
    
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
        "_gaq.push(['filmstrip._setAccount', '" +
            GLOBAL_config.analyticsId + "']);\n" +
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