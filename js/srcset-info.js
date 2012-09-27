(function(exports) {

  var INT_REGEXP = /^[0-9]+$/ig;

  function SrcsetInfo(options) {
    this.imageCandidates = [];
    this.srcValue = options.src;
    this.srcsetValue = options.srcset;
    this.isValid = true;
    this.error = '';

    this._parse(this.srcsetValue);
    if (!this.isValid) {
      console.error('Error: ' + this.error);
    }
  }



  /**
   * Parses the string that goes srcset="here".
   *
   * @returns [{url: _, x: _, w: _, h:_}, ...]
   */
  SrcsetInfo.prototype._parse = function() {
    if (this.srcsetValue !== null) {
      var value = this.srcsetValue;
      var length = value.length;
      var position = 0;
      var currentUrl = [];
      var currentDescriptor = [];
      var parsingState = 1;

      while (position < length) {
        var currentChar = value[position];
        switch (parsingState) {
          case 1:
            if (currentChar === ' ') {
              parsingState = 2;
            } else {
              currentUrl.push(currentChar);
            }
            break;
          case 2:
            if (currentChar === ',') {
              this._parseCandidate(currentUrl.join(''), currentDescriptor.join(''));
              currentUrl = [];
              currentDescriptor = [];
              parsingState = 3;
            } else {
              currentDescriptor.push(currentChar);
            }
            break;
          case 3:
            if (currentChar !== ' ') {
              position--;
              parsingState = 1;
            }
        }
        position++;
      }

      this._parseCandidate(currentUrl.join(''), currentDescriptor.join(''));
    }

    // If there's a srcValue, add it to the candidates too.
    if (this.srcValue) {
      this._addCandidate(new ImageInfo({src: this.srcValue}));
    }
  };

  SrcsetInfo.prototype._parseCandidate = function(src, descriptor) {
    var desc = this._parseDescriptors(descriptor.trim());
    var imageInfo = new ImageInfo({
      src: src,
      x: desc.x,
      w: desc.w,
      h: desc.h
    });
    this._addCandidate(imageInfo);
  };

  /**
   * Add an image candidate, unless it's a dupe of something that exists already.
   */
  SrcsetInfo.prototype._addCandidate = function(imageInfo) {
    for (var j = 0; j < this.imageCandidates.length; j++) {
      var existingCandidate = this.imageCandidates[j];
      if (existingCandidate.x == imageInfo.x &&
          existingCandidate.w == imageInfo.w &&
          existingCandidate.h == imageInfo.h) {
        // It's a dupe, so return early without adding the image candidate.
        return;
      }
    }
    this.imageCandidates.push(imageInfo);
  };

  SrcsetInfo.prototype._parseDescriptors = function(descString) {
    if (descString === '') {
      this.error = 'Empty descriptor found for srcset candidate.';
      this.isValid = false;
      return {};
    }

    var descriptors = descString.split(/\s/);

    var out = {};
    for (var i = 0; i < descriptors.length; i++) {
      var desc = descriptors[i];
      if (desc.length > 0) {
        var lastChar = desc.charAt(desc.length-1);
        var value = desc.substring(0, desc.length-1);
        var intVal = parseInt(value, 10);
        var floatVal = parseFloat(value);
        if (value.match(INT_REGEXP) && lastChar === 'w') {
          out[lastChar] = intVal;
        } else if (value.match(INT_REGEXP) && lastChar =='h') {
          out[lastChar] = intVal;
        } else if (!isNaN(floatVal) && lastChar == 'x') {
          out[lastChar] = floatVal;
        } else {
          this.error = 'Invalid srcset descriptor found in "' + desc + '".';
          this.isValid = false;
        }
      }
    }
    return out;
  };

  function ImageInfo(options) {
    this.src = options.src;
    this.w = options.w || Infinity;
    this.h = options.h || Infinity;
    this.x = options.x || 1;
  }

  exports.SrcsetInfo = SrcsetInfo;

})(window);
