(function(exports) {

  function isSrcsetImplemented() {
    var img = new Image();
    return 'srcset' in img;
  }

  function insertNative() {
    var noscripts = document.querySelectorAll('[data-srcset] noscript');
    for (var i = 0, l = noscripts.length; i < l; i++) {
      var noscript = noscripts[i];
      noscript.parentElement.innerHTML = noscript.innerText;
    }
  }

  function main() {
    // If the browser doesn't support querySelectorAll or supports @srcset natively, don't do any polyfill.
    if (isSrcsetImplemented()) {
      insertNative();
      return;
    }

    // Get the user agent's capabilities (viewport width, viewport height, dPR).
    var viewportInfo = new ViewportInfo();
    viewportInfo.compute();
    // Go through all divs on the page.
    // TODO: is there a better way of selecting these while still supporting IE < 9?
    var images = document.getElementsByTagName('div');
    for (var i = 0, l = images.length; i < l; i++) {
      var poly = images[i];
      // Check the div has a data-srcset attribute
      // Prefer hasAttribute but fallback to getAttribute, making the assumption is returns null for non-existent attributes
      if (typeof(document.hasAttribute) === "undefined" ? poly.getAttribute('data-srcset') !== null : poly.hasAttribute('data-srcset')) {
        var srcset = poly.getAttribute('data-srcset');
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
