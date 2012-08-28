# A spec-compatible, unit-tested polyfill for `<img srcset>`

See [the specification][spec] for the reference algorithm.

This branch uses a `<div>` shim to prevent downloading of default image on hi-res devices.

## Usage

Emulate the `<img>` element with `srcset` attribute using a `<div>` with `data-` attributes. For example:

    <div data-alt="The Breakfast Combo" data-src="banner.jpeg"
         data-srcset="banner-HD.jpeg 2x, banner-phone.jpeg 100w,
                      banner-phone-HD.jpeg 100w 2x">
        <noscript><img alt="The Breakfast Combo" src="banner.jpg"
                       srcset="banner-HD.jpeg 2x, banner-phone.jpeg 100w,
                               banner-phone-HD.jpeg 100w 2x"/></noscript>
    </div>

The `<noscript>` element ensures non-Javascript browsers still render the original image, using the `srcset` attribute if natively support is available.

Include `build/srcset.min.js` in your page.

Optionally include [domready][domready] before this if you need fallback for non-`DOMContentLoaded` capable browsers.

## Open questions

- How to reliably check for srcset support in the browser (so as to not
  attempt to polyfill if it's not necessary?)
- Is it safe to use `-webkit-transform` to scale things?
- Is it worth falling back to `-webkit-image-set` if available?

[spec]: http://www.whatwg.org/specs/web-apps/current-work/multipage/embedded-content-1.html#processing-the-image-candidates
[domready]: https://github.com/ded/domready