
# classical-noise

Classical Perlin Noise Generator

> Ported from [Stefan Gustavson's java implementation](http://staffwww.itn.liu.se/~stegu/classicalnoise/classicalnoise.pdf)
> Read Stefan's excellent paper for details on how this code works.

This `component` version is cloned from the [gist](https://gist.github.com/banksean/304522) by [Sean McCullough](https://github.com/banksean)
  

## Installation

    $ component install mnmly/classical-noise

## Usage

```javascript

  var Noise = require('classical-noise')
    , generator = new ClassicalNoise();
  
  // => returns number between `[-1, 1]`
  console.log(generator.noise(0.001, 0, 0));

  // => returns random number but close enough to the value above.
  console.log(generator.noise(0.001 + 0.001, 0, 0));
    
```

## License

  MIT
