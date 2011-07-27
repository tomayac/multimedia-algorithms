(function () {        
  // global configuration object
  var GLOBAL_config = {
    normalTimeout: 100,
    debugTimeout: 500,
    normalCanvasWidth: 70,
    debugCanvasWidth: 300,
    videoHeight: 200,
    rows: 20,
    cols: 20,
    boosting: 2.0,
    limiting: 0.5,
    threshold: 50,
    proxy: 'http://tomayac.com/youpr0n/proxy.php?video=',
    youtube: 'http://www.youtube.com',
    step: 1,
    sortFunction: function (a, b) { return a - b; }
  };        
  
  var GLOBAL_scenesDataStructure = {};  
  var GLOBAL_interval = null;            
  
  // determine if we are embedded in a different webpage
  var GLOBAL_embedded =
      window.parent.location.origin !== window.location.origin;        
  var GLOBAL_embeddedOptions = document.querySelector('.embedded');
  // if we are embedded, do not show the options
  if (!GLOBAL_embedded) {
    GLOBAL_embeddedOptions.classList.toggle('embedded');            
  }
  
  // if we are embedded listen to current position updated from the
  // extension running on youtube
  if (GLOBAL_embedded) {          
    window.addEventListener('message', function (e) {
      if (e.origin !== GLOBAL_config.youtube) {
        return;
      }
      if (e.data.type === 'currentTime') {
        var currentTime = e.data.currentTime;
        var timestamps = Object.keys(GLOBAL_scenesDataStructure);
        for (var i = 0, len = timestamps.length; i < len; i++) {
          var time = GLOBAL_scenesDataStructure[i].time;
          if (time === currentTime) {
            document.getElementById('frame_' + i)
                .classList.add('current');
          } else {
            document.getElementById('frame_' + i)
                .classList.remove('current');                  
          }
        }
      }
    }, false);
  }
      
  // show similar tiles checkbox
  var GLOBAL_similarCheckbox = document.getElementById('similar');
  var GLOBAL_showSimilar = GLOBAL_similarCheckbox.checked;
  GLOBAL_similarCheckbox.addEventListener('change', function (e) {
    GLOBAL_showSimilar = this.checked;
  }, false);
  
  // show different tiles checkbox
  var GLOBAL_differentCheckbox = document.getElementById('different');
  var GLOBAL_showDifferent = GLOBAL_differentCheckbox.checked;
  GLOBAL_differentCheckbox.addEventListener('change', function (e) {
    GLOBAL_showDifferent = this.checked;
  }, false);
  
  // show debug mode checkbox
  var GLOBAL_debugCheckbox = document.getElementById('debug');
  var GLOBAL_debugOptions = document.getElementById('debug_options');
  var GLOBAL_debug = GLOBAL_debugCheckbox.checked;
  GLOBAL_debugOptions.classList.toggle('debug_options');
  var GLOBAL_timeout = null;
  var GLOBAL_canvasWidth = null;
  if (!GLOBAL_debug) {
    GLOBAL_timeout = GLOBAL_config.normalTimeout;
    GLOBAL_canvasWidth = GLOBAL_config.normalCanvasWidth;
  } else {
    GLOBAL_timeout = GLOBAL_config.debugTimeout;
    GLOBAL_canvasWidth = GLOBAL_config.debugCanvasWidth;
  }
  GLOBAL_debugCheckbox.addEventListener('change', function (e) {
    GLOBAL_debug = GLOBAL_debugCheckbox.checked;
    GLOBAL_debugOptions.classList.toggle('debug_options');
    if (!GLOBAL_debug) {
      GLOBAL_avgCanvas.parentNode.removeChild(GLOBAL_avgCanvas);
      GLOBAL_canvas.parentNode.removeChild(GLOBAL_canvas);
      GLOBAL_timeout = GLOBAL_config.normalTimeout;
      GLOBAL_canvasWidth = GLOBAL_config.normalCanvasWidth;
    } else {
      GLOBAL_averageCanvasDiv.appendChild(GLOBAL_canvas);
      GLOBAL_averageCanvasDiv.appendChild(GLOBAL_avgCanvas);
      GLOBAL_timeout = GLOBAL_config.debugTimeout;
      GLOBAL_canvasWidth = GLOBAL_config.debugCanvasWidth;
    }
  }, false);
  
  // progress indicator for video analysis
  var GLOBAL_videoProgress = document.createElement('progress');        
  var GLOBAL_videoProgressContainer = document.querySelector('#progress');                
  // only show the video progress indicator if we are not embedded
  if (!GLOBAL_embedded) {
    GLOBAL_videoProgressContainer.appendChild(GLOBAL_videoProgress);
  }
  GLOBAL_videoProgress.max = 100;
  var GLOBAL_videoProgressValue = 0; 
  GLOBAL_videoProgress.value = GLOBAL_videoProgressValue;
  
  // start button
  var GLOBAL_videoIdInput = document.getElementById('video_id');
  var GLOBAL_startButton = document.getElementById('start');
  GLOBAL_startButton.addEventListener('click', function (e) {
    start(GLOBAL_videoIdInput.value);
  }, false);                
  
  // main video element
  var GLOBAL_video = document.createElement('video');
  GLOBAL_video.controls = 'controls';
  var GLOBAL_videoContainer = document.querySelector('DIV.video');
  // only show the video if we are not embedded
  if (!GLOBAL_embedded) {
    GLOBAL_videoContainer.appendChild(GLOBAL_video);          
  }
  GLOBAL_video.height = GLOBAL_config.videoHeight;
  
  // container for the two debug canvases
  var GLOBAL_averageCanvasDiv = document.getElementById('average_canvas');
  
  // container for the video scenes
  var GLOBAL_scenesContainer = document.querySelector('#scenes');
  
  // rows slider
  var GLOBAL_rowsSlider = document.getElementById('rows');
  var GLOBAL_rowsValue = document.getElementById('rows_value');
  var GLOBAL_rows = GLOBAL_config.rows;
  GLOBAL_rowsValue.value = GLOBAL_rows;
  GLOBAL_rowsSlider.value = GLOBAL_rows;
  GLOBAL_rowsSlider.addEventListener('change', function (e) {
    GLOBAL_rows = this.value;
    GLOBAL_rows_x_cols = GLOBAL_rows * GLOBAL_cols;
    assureValidTiles();
    GLOBAL_rowsValue.value = GLOBAL_rows;
    GLOBAL_rowsOrColsChanged = true;
  }, false);
  
  // average distance input
  var GLOBAL_averageDistanceInput = document.getElementById('average');
  GLOBAL_averageDistanceInput.value = 0;
  
  // standard devitation input
  var GLOBAL_standardDeviationInput =
      document.getElementById('deviation');
  GLOBAL_standardDeviationInput.value = 0;
  
  // adjust scene threshold to frame standard deviation checkbox
  var GLOBAL_keepSyncedCheckbox = document.getElementById('keep_synced');
  var GLOBAL_keepSynced = GLOBAL_keepSyncedCheckbox.checked;
  GLOBAL_keepSyncedCheckbox.addEventListener('change', function (e) {
    GLOBAL_keepSynced = this.checked;
    if (GLOBAL_keepSynced) {
      GLOBAL_threshold = GLOBAL_standardDeviationInput.value;
      if (GLOBAL_thresholdSlider.value !== GLOBAL_threshold) {
        GLOBAL_thresholdSlider.value = GLOBAL_threshold;
        GLOBAL_thresholdValue.value = GLOBAL_threshold;            
        updateScenes();
      }
    }
  }, false);
  
  // cols slider
  var GLOBAL_colsSlider = document.getElementById('cols');
  var GLOBAL_colsValue = document.getElementById('cols_value');
  var GLOBAL_cols = GLOBAL_config.cols;
  GLOBAL_colsValue.value = GLOBAL_cols;
  GLOBAL_colsSlider.value = GLOBAL_cols;
  var GLOBAL_rows_x_cols = GLOBAL_rows * GLOBAL_cols;
  var GLOBAL_rowsOrColsChanged = false;
  GLOBAL_colsSlider.addEventListener('change', function (e) {
    GLOBAL_cols = this.value;
    GLOBAL_rows_x_cols = GLOBAL_rows * GLOBAL_cols;
    assureValidTiles();
    GLOBAL_colsValue.value = GLOBAL_cols;
    GLOBAL_rowsOrColsChanged = true;
  }, false);
  
  // threshold slider
  var GLOBAL_thresholdSlider = document.getElementById('threshold');
  var GLOBAL_thresholdValue = document.getElementById('threshold_value');
  var GLOBAL_threshold = GLOBAL_config.threshold;
  GLOBAL_thresholdValue.value = GLOBAL_threshold;
  GLOBAL_thresholdSlider.value = GLOBAL_threshold;
  GLOBAL_thresholdSlider.addEventListener('change', function (e) {
    if (GLOBAL_threshold !== this.value) {
      GLOBAL_threshold = this.value;
      GLOBAL_thresholdValue.value = GLOBAL_threshold;
      updateScenes();
    }
  }, false);      
  
  // different tiles boosting slider
  var GLOBAL_boostingSlider = document.getElementById('boosting');
  var GLOBAL_boostingValue = document.getElementById('boosting_value');
  var GLOBAL_boosting = GLOBAL_config.boosting;
  GLOBAL_boostingSlider.value = GLOBAL_boosting;
  GLOBAL_boostingValue.value = GLOBAL_boosting;
  GLOBAL_boostingSlider.addEventListener('change', function (e) {
    if (GLOBAL_boosting !== this.value) {
      GLOBAL_boosting = round(this.value, 1);
      GLOBAL_boostingValue.value = GLOBAL_boosting;
      updateScenes();
    }
  }, false);
  
  // similar tiles limiting slider
  var GLOBAL_limitingSlider = document.getElementById('limiting');
  var GLOBAL_limitingValue = document.getElementById('limiting_value');
  var GLOBAL_limiting = GLOBAL_config.limiting;
  GLOBAL_limitingSlider.value = GLOBAL_limiting;
  GLOBAL_limitingValue.value = GLOBAL_limiting;
  GLOBAL_limitingSlider.addEventListener('change', function (e) {
    if (GLOBAL_limiting !== this.value) {
      GLOBAL_limiting = round(this.value, 1);
      GLOBAL_limitingValue.value = GLOBAL_limiting;
      updateScenes();
    }
  }, false);
  
  // most similar / different tiles slider
  var GLOBAL_tilesSlider = document.getElementById('tiles');
  var GLOBAL_tilesValue = document.getElementById('tiles_value');
  var GLOBAL_tilesMax = document.getElementById('tiles_max');
  var GLOBAL_tiles = ~~(GLOBAL_rows_x_cols / 3);
  GLOBAL_tilesSlider.max = GLOBAL_rows_x_cols;
  GLOBAL_tilesMax.innerHTML = GLOBAL_rows_x_cols;
  GLOBAL_tilesSlider.value = GLOBAL_tiles;
  GLOBAL_tilesValue.value = GLOBAL_tiles;
  GLOBAL_tilesSlider.addEventListener('change', function (e) {
    GLOBAL_tiles = this.value;
    GLOBAL_tilesValue.value = GLOBAL_tiles;
  }, false);
  
  // main canvas element (displays frames from the main video element in
  // debug mode)
  var GLOBAL_canvas = document.createElement('canvas');
  // average canvas element (displays average tiles and most similar /
  // different tiles in debug mode)
  var GLOBAL_avgCanvas = document.createElement('canvas');
  if (GLOBAL_debug) {          
    GLOBAL_averageCanvasDiv.appendChild(GLOBAL_canvas);
    GLOBAL_averageCanvasDiv.appendChild(GLOBAL_avgCanvas);
  }

  // assures that the number of most similar / different tiles is never
  // greater than the number of absolute tiles
  function assureValidTiles() {
    GLOBAL_tilesSlider.max = GLOBAL_rows_x_cols;
    GLOBAL_tilesMax.innerHTML = GLOBAL_rows_x_cols;
    if (GLOBAL_rows_x_cols < GLOBAL_tiles) {
      GLOBAL_tiles = GLOBAL_rows_x_cols;
      GLOBAL_tilesSlider.value = GLOBAL_tiles;
      GLOBAL_tilesValue.value = GLOBAL_tiles;
    }
  }
  
  // rounds a double number to n decimals
  function round(num, numOfDec) {
    var pow10s = Math.pow(10, numOfDec || 0);
    return numOfDec ? Math.round(pow10s * num) / pow10s : num;
  }
  
  // calculates the distance between two frames taking into account
  // the different tiles boosting factor and the similar tiles limiting
  // factor
  function calculateFrameDistance(thisFrame, lastFrame) {
    var abs = Math.abs;
    
    // first calculate the absolute distance form tile to tile
    // and store the results in a distance vector
    var absoluteDistance = [];
    for (var i = 0; i < GLOBAL_rows_x_cols; i++) {
      absoluteDistance[i] = abs(thisFrame[i] - lastFrame[i]);
    }
    // copy the distance vector and sort it
    var absoluteDistanceCopy = absoluteDistance.slice(0);
    absoluteDistanceCopy.sort(GLOBAL_config.sortFunction);
    var mostSimilarTiles = [];
    var mostDifferentTiles = [];
    var index = null;
    // find the most similar and the most different tiles
    for (var i = 0; i < GLOBAL_tiles; i++) {
      // find the most different tiles
      var maxDifference =
          absoluteDistanceCopy[GLOBAL_rows_x_cols - i - 1];
      if (maxDifference > 0) {
        index = absoluteDistance.indexOf(maxDifference);
        mostDifferentTiles[i] = index;
        // x-out the already considered tiles
        absoluteDistance[index] = null;
      }
      // find the most similar tiles
      var minDifference = absoluteDistanceCopy[i];
      if (minDifference < maxDifference) {
        index = absoluteDistance.indexOf(minDifference);
        mostSimilarTiles[i] = index;
        // x-out the already considered tiles
        absoluteDistance[index] = null;
      }
    }
    // apply boosting / limiting factors to the most different / similar
    // tiles
    for (var i = 0; i < GLOBAL_rows_x_cols; i++) {
      var value = thisFrame[i];
      var boostingFactor = 1;
      if (mostSimilarTiles.indexOf(i) !== -1) {
        boostingFactor = GLOBAL_limiting;
      } else if (mostDifferentTiles.indexOf(i) !== -1) {
        boostingFactor = GLOBAL_boosting;
      }
      thisFrame.average += value * boostingFactor;
    }
    // calculate the average with applied boosting / limiting factors
    thisFrame.average = ~~(thisFrame.average / GLOBAL_rows_x_cols);
    // most different / similar tile data only
    var tileData = {
      mostDifferentTiles: mostDifferentTiles,
      mostSimilarTiles: mostSimilarTiles
    };
    // distance data only
    var distance = {
      absolute: abs(thisFrame.average - lastFrame.average),
      tiles: thisFrame
    }
    // return both distance data and tile data together
    return {
      distance: distance,
      tileData: tileData
    };
  }    
  
  // updates the frame average distance and the frame standard deviation
  function updateSceneStats(average, standardDeviation) {
    GLOBAL_averageDistanceInput.value = average;
    GLOBAL_standardDeviationInput.value = standardDeviation;
    if (GLOBAL_keepSynced) {
      GLOBAL_thresholdSlider.value = standardDeviation;
      GLOBAL_thresholdValue.value = standardDeviation;            
    }
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

  // generates the final scenes html        
  function generateScenesHtml() {          
    // make sure the different video scene html snippets get
    // displayed in the correct time order
    var timestamps = Object.keys(GLOBAL_scenesDataStructure);
    timestamps.sort(GLOBAL_config.sortFunction);
    var innerHtml = '';
    for (var i = 0, len = timestamps.length; i < len; i++) {
      var scenesData = GLOBAL_scenesDataStructure[i];
      var distance = scenesData.distance.absolute;
      var divCss = distance > GLOBAL_threshold ?
          'class="break strip"': 'class="strip"';
      var time = scenesData.time;    
      innerHtml +=
          '<div id="frame_' + time + '" ' + divCss + '><img src="' +
          scenesData.dataUri + '"/><br/><small data="' + time + '">' +
          formatTime(time) +
          (!GLOBAL_embedded ?
              ' / <strong>' + distance + '</strong>' : '') +
          '</small></div>';            
    }
    
    function selectDiv(nodeName, target) {
      if ((nodeName === 'IMG') ||
          (nodeName === 'SMALL') ||
          (nodeName === 'BR')) {
        return target.parentNode;  
      } else if (nodeName === 'STRONG') {
        return target.parentNode.parentNode;
      } else if (nodeName === 'DIV') {
        return target;
      } else {
        return null;
      }
    }
    function selectSmall(nodeName, target) {
      if ((nodeName === 'IMG') ||
          (nodeName === 'BR')) {
        return target.parentNode.lastChild;    
      } else if (nodeName === 'SMALL') {
        return target;
      } else if (nodeName === 'STRONG') {
        return target.parentNode;
      } else if (nodeName === 'DIV') {
        return target.lastChild;
      } else {
        return null;
      }
    }
    GLOBAL_scenesContainer.innerHTML = innerHtml;
    GLOBAL_scenesContainer.addEventListener('mouseover', function (e) {
      var div = null;
      div = selectDiv(e.target.nodeName, e.target);
      if (div) {
        div.style.backgroundColor = '#FAF8CC';
      }            
    }, false);
    GLOBAL_scenesContainer.addEventListener('mouseout', function (e) {
      var div = null;
      div = selectDiv(e.target.nodeName, e.target);
      if (div) {
        div.style.backgroundColor = 'transparent';
      }
    }, false);                    
    GLOBAL_scenesContainer.addEventListener('click', function (e) {
      var small = null;
      small = selectSmall(e.target.nodeName, e.target);            
      if (small) {
        var time = small.getAttribute('data');
        if (GLOBAL_embedded) {
          window.parent.postMessage({
            jumpTo: time,
            type: 'jumpTo'
          }, GLOBAL_config.youtube);
        } else {
          GLOBAL_video.currentTime = time;
          GLOBAL_video.play();
        }
      }
    }, false);                    
  }         
  
  // updates the video scenes distribution upon changing either of: scene
  // threshold, different tile boosting factor, similar tile limiting
  // factor
  function updateScenes() {
    // recalculate distances with new limiting and boosting factors
    var newDistances = [];
    var thisFrame = GLOBAL_scenesDataStructure[0].distance.tiles;
    var lastFrame = thisFrame;
    var newDistance =
        (calculateFrameDistance(thisFrame, lastFrame)).distance;
    newDistances[0] = newDistance.absolute;
    var len = Object.keys(GLOBAL_scenesDataStructure).length;
    for (var i = 1 /* yes, 1 */; i < len; i++) {
      thisFrame = GLOBAL_scenesDataStructure[i].distance.tiles;
      lastFrame = GLOBAL_scenesDataStructure[i - 1].distance.tiles;
      newDistance =
          (calculateFrameDistance(thisFrame, lastFrame)).distance;
      newDistances[i] = newDistance.absolute;
    }
    // recalculate average distance, standard deviation distance
    var averageDistance = ~~Stat.getAverage(newDistances);
    var standardDeviationDistance =
        ~~Stat.getStandardDeviation(newDistances);
    updateSceneStats(averageDistance, standardDeviationDistance);
    // update scene distribution display
    var stripDivs = document.querySelectorAll('.strip');
    for (var i = 0, len = stripDivs.length; i < len; i++) {
      var div = stripDivs[i];
      div.classList.remove('break');
      var distance = newDistances[i];
      if (distance > GLOBAL_threshold) {
        div.classList.add('break');
      }            
      div.getElementsByTagName('strong')[0].innerHTML = distance;
    }
  }        
  
  // main start function        
  function start(id) {
    // removes all child nodes from an element
    function removeAllChildNodes(elem) {
      while(elem.hasChildNodes()){
        elem.removeChild(elem.lastChild);
      }
    }
    
    // if an interval was active upon start-up, clear it          
    if (GLOBAL_interval) {
      clearInterval(GLOBAL_interval);
      GLOBAL_interval = null;
    }
    // remove all child nodes from the video element and video scene
    // container
    removeAllChildNodes(GLOBAL_video);          
    removeAllChildNodes(GLOBAL_scenesContainer);
    // copy the video (from youtube via id, or anywhere via url) to the
    // local domain (because of the same origin policy that applies to
    // canvas)
    $.ajax({
      dataType: 'json',
      url: GLOBAL_config.proxy + id,
      success: function (data) {
        if (!data) {
          var error = 'Cannot Embed Video.';
          alert(error);
          throw error;
        }
        for (var i = 0, len = data.length; i < len; i++) {
          var source = document.createElement('source');
          source.src = data[i].url;
          if (data[i].type) {
            source.type = data[i].type
          }
          GLOBAL_video.appendChild(source);
        }
        GLOBAL_video.load();
      }
    });
    
    // on manual video play, remove the video scenes from the video scene
    // container
    GLOBAL_video.addEventListener('play', function (e) {
      if (GLOBAL_video.currentTime === 0) {
        removeAllChildNodes(GLOBAL_scenesContainer);
      }
    }, false);
    
    // upon load of all video metadata, configure the canvas dimensions
    // for the debug canvases
    GLOBAL_video.addEventListener('loadedmetadata', function (e) {
      var max = Math.max;
      var min = Math.min;
      var videoWidth = GLOBAL_video.videoWidth;
      var videoHeight = GLOBAL_video.videoHeight;
      var videoRatio = videoWidth / videoHeight;
      GLOBAL_video.volume = 0;
      var canvasHeight = ~~(GLOBAL_canvasWidth / videoRatio);
      GLOBAL_canvas.width = GLOBAL_canvasWidth;
      GLOBAL_canvas.height = canvasHeight;            
      GLOBAL_avgCanvas.width = GLOBAL_canvasWidth;
      GLOBAL_avgCanvas.height = canvasHeight;              
      var avgCtx = GLOBAL_avgCanvas.getContext('2d');
      var ctx = GLOBAL_canvas.getContext('2d');            
      
      // the first "last" frame does not exist
      var lastFrame = null;
      
      // upon load of the complete video data, start analyzing the video
      GLOBAL_video.addEventListener('loadeddata', function (e) {
        analyzeVideo();
      }, false);
      
      // main video analysis function
      function analyzeVideo() {
        
        // draws the most similar / different tiles on the average canvas
        // when in debug mode
        function drawMostSimilarDifferentTiles(
            mostDifferentTiles,
            mostSimilarTiles) {
          var mod = null;
          var div = null;
          var dx = null;
          var dy = null;
          var dw2 = dw - 2;
          var dh2 = dh - 2;
          for (var i = 0; i < GLOBAL_tiles; i++) {
            // all most different tiles
            if (GLOBAL_showDifferent) {
              var mostDifferentTile = mostDifferentTiles[i];
              mod = (mostDifferentTile % GLOBAL_cols);
              div = ~~(mostDifferentTile / GLOBAL_cols);
              dx = mod * dw;
              dy = div * dh;
              avgCtx.strokeStyle = 'red';
              avgCtx.strokeRect(dx + 1, dy + 1, dw2, dh2);
            }
            // all most similar tiles
            if (GLOBAL_showSimilar) {
              var mostSimilarTile = mostSimilarTiles[i];
              mod = (mostSimilarTile % GLOBAL_cols);
              div = ~~(mostSimilarTile / GLOBAL_cols);
              dx = mod * dw;
              dy = div * dh;
              avgCtx.strokeStyle = 'green';
              avgCtx.strokeRect(dx + 1, dy + 1, dw2, dh2);
            }
          }
        }
        
        // analyze the video in n second steps
        var step = GLOBAL_config.step;
        // canvas and average canvas step widths / heights for the tiles
        var sw = ~~(videoWidth / GLOBAL_cols);
        var sh = ~~(videoHeight / GLOBAL_rows);
        var dw = ~~(GLOBAL_canvasWidth / GLOBAL_cols);
        var dh = ~~(canvasHeight / GLOBAL_rows);
        // reset all variables before the main video analysis interval
        // starts
        GLOBAL_video.currentTime = 0;
        var videoDuration = GLOBAL_video.duration;              
        var counter = 0;
        // main video analysis interval, active while the video has not
        // been entirely analyzed
        var lastCurrentTime = -1;
        GLOBAL_interval = setInterval(function () {                
          // only recalculate canvas and average canvas step widths /
          // heights for the tiles when the tile layout has changed
          if (GLOBAL_rowsOrColsChanged) {
            sw = ~~(videoWidth / GLOBAL_cols);
            sh = ~~(videoHeight / GLOBAL_rows);
            dw = ~~(GLOBAL_canvasWidth / GLOBAL_cols);
            dh = ~~(canvasHeight / GLOBAL_rows);
            GLOBAL_rowsOrColsChanged = false;
          }
          // freeze the current time for the whole interval run-through                
          var currentTime = GLOBAL_video.currentTime;
          // check if the current time is less than or equal the last 
          // current time. this can happen sometimes due to seekability
          // issues. if it happens, just jump to the next step.
          if (currentTime <= lastCurrentTime) {
            GLOBAL_video.currentTime += step;
            return;
          }
          lastCurrentTime = currentTime;
          var percentage = ~~(currentTime / videoDuration * 100);                
          
          // update progress indicator
          if (percentage > GLOBAL_videoProgressValue) {
            // only send the message if we are embedded
            if (GLOBAL_embedded) {
              window.parent.postMessage({
                progress: percentage,
                type: 'progress'
              }, GLOBAL_config.youtube);
            }
            GLOBAL_videoProgress.value = percentage;
            GLOBAL_videoProgressValue = percentage;
          }
          
          // initialize this frame's object
          var thisFrame = {};
          // for all tiles
          for (var i = 0; i < GLOBAL_rows_x_cols; i++) {
            // calculate the boundaries for the current tile from the
            // video and translate it to boundaries on the main canvas
            var mod = (i % GLOBAL_cols);
            var div = ~~(i / GLOBAL_cols);
            var sx = mod * sw;
            var sy = div * sh;
            var dx = mod * dw;
            var dy = div * dh;
            // draw the current tile on the main canvas
            ctx.drawImage(GLOBAL_video, sx, sy, sw, sh, dx, dy, dw, dh);
            // calculate the histogram of the current tile
            var histogram =
                Histogram.getHistogram(ctx, dx, dy, dw, dh, false);
            // when in debug mode, draw the current tile's average color
            // on the average canvas
            if (GLOBAL_debug) {
              avgCtx.fillStyle = histogram.css;
              avgCtx.fillRect(dx, dy, dw, dh);
            }
            // store the current tile's average color value (weighted
            // triple (r + g + b), see histogram.js)
            thisFrame[i] = histogram.average;
          }
          // initialize this frame's overall average color value
          thisFrame.average = 0;
          // for the very first frame, the "last" frame is the current
          // frame
          if (!lastFrame) {
            lastFrame = thisFrame;
          }
          // calculate the distance between this frame and the last frame
          var distanceData = calculateFrameDistance(thisFrame, lastFrame);
          var distance = distanceData.distance;                
          // if in debug mode, draw the most different / similar tiles on
          // the average canvas.
          if (GLOBAL_debug) {
            drawMostSimilarDifferentTiles(
                distanceData.tileData.mostDifferentTiles,
                distanceData.tileData.mostSimilarTiles);
          }
          // the new last frame is the current this frame
          lastFrame = thisFrame;
          // save current frame's metadata in the scenes data structure
          GLOBAL_scenesDataStructure[counter] = {
            time: currentTime,
            dataUri: GLOBAL_canvas.toDataURL('image/png'),
            distance: distance
          };                
          // prepare the next video step
          var nextTime = currentTime + step;
          // if the next step would be beyond the video's duration, clear
          // the interval
          if (nextTime >= videoDuration) {
            clearInterval(GLOBAL_interval);
            GLOBAL_videoProgress.value = 100;                  
            // only send the message if we are embedded
            if (GLOBAL_embedded) {
              window.parent.postMessage({
                progress: 100,
                type: 'progress'
              }, GLOBAL_config.youtube);                  
              window.parent.postMessage({
                type: 'getCurrentTime'
              }, GLOBAL_config.youtube);
            }
            // generate the scenes html
            generateScenesHtml();
            // recalculate average distance, standard deviation distance
            var absoluteDistances = [];
            for (var i = 0; i < counter; i++) {
              absoluteDistances[i] =
                  GLOBAL_scenesDataStructure[i].distance.absolute;
            }
            var average = ~~Stat.getAverage(absoluteDistances);
            var standardDeviation =
                ~~Stat.getStandardDeviation(absoluteDistances);                  
            GLOBAL_thresholdSlider.value = standardDeviation;
            GLOBAL_thresholdValue.value = standardDeviation;
            updateSceneStats(average, standardDeviation);
          // if the next video step is within the video's duration, seek
          // to the new position
          } else {
            GLOBAL_video.currentTime = nextTime;
          }
          // needed for the video scene time order
          counter++;
        }, GLOBAL_timeout);
      }
    }, false);
  } 
  
  // automatically starts the analysis process if the script gets run 
  // remotely via an iframe
  (function bootstrap() {
    var videoId = window.location.getParameter('v');
    if (videoId) {            
      GLOBAL_videoIdInput.value = videoId;            
      start(videoId);          
    }          
  })();        
         
})();