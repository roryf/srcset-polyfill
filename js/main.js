(function(exports) {

  function isSrcsetImplemented() {
    var img = new Image();
    return 'srcset' in img;
  }

  function insertNative() {
    // TODO: DRY up this with the real polyfill, too much overlap?
    // TODO: better selector we can use here?
    var divs = document.getElementsByTagName('div');
    for (var i = 0, l = divs.length; i < l; i++) {
      var div = divs[i];
      // Prefer hasAttribute but fallback to getAttribute, making the assumption is returns null for non-existent attributes
      if (typeof(document.hasAttribute) === "undefined" ? div.getAttribute('data-srcset') !== null : div.hasAttribute('data-srcset')) {
        var img = document.createElement('img');
        img.alt = div.getAttribute('data-alt');
        img.src = div.getAttribute('data-src');
        img.setAttribute('srcset', div.getAttribute('data-srcset'));
        div.appendChild(img);
      }
    }
  }

  function main() {
    // If the browser doesn't support querySelectorAll or supports @srcset natively, don't do any polyfill.
    // Ideally we would just bail if querySelectorAll is not supported, but because of the <noscript> we have to insert an image somehow
    if (!('querySelectorAll' in document) || isSrcsetImplemented()) {
      insertNative();
      return;
    }

    // Get the user agent's capabilities (viewport width, viewport height, dPR).
    var viewportInfo = new ViewportInfo();
    viewportInfo.compute();
    // Go through all images on the page.
    var images = document.querySelectorAll('[data-srcset]');
    for (var i = 0; i < images.length; i++) {
      var poly = images[i];
      // Parse the srcset from the image element.
      var srcset = poly.getAttribute('data-srcset');
      if (srcset) {
        var srcsetInfo = new SrcsetInfo({src: poly.getAttribute('data-src'), srcset: srcset});
        // Go through all the candidates, pick the best one that matches.
        var imageInfo = viewportInfo.getBestImage(srcsetInfo);
        // TODO: consider using -webkit-image-set instead (if available).
        // Construct an <img> tag with the correct src
        var img = document.createElement('img');
        img.alt = poly.getAttribute('data-alt');
        img.src = imageInfo.src;
        // Scale the image if necessary (ie. x != 1).
        img.style.webkitTransform = 'scale(' + (1/imageInfo.x) + ')';
        img.style.webkitTransformOrigin = '0 0';
        poly.appendChild(img);
      }
    }
  }

  if ('domready' in window) {
    window.domready(main);
  } else {
    window.addEventListener('DOMContentLoaded', main);
  }

})(window);
