const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * A struct to define an adaptive color set.
 */
const colorStruct = {
  info: {
    version: 1,
    author: 'xcode'
  },
  colors: [
    // DEFAULT
    {
      idiom: 'universal',
      color: {
        'color-space': 'srgb',
        components: {
          red: '255',
          alpha: '1.000',
          blue: '255',
          green: '255'
        }
      }
    },
    // LIGHT
    {
      idiom: 'universal',
      appearances: [{
        appearance: 'luminosity',
        value: 'light'
      }],
      color: {
        'color-space': 'srgb',
        components: {
          red: '255',
          alpha: '1.000',
          blue: '255',
          green: '255'
        }
      }
    },
    // DARK
    {
      idiom: 'universal',
      appearances: [{
        appearance: 'luminosity',
        value: 'dark'
      }],
      color: {
        'color-space': 'srgb',
        components: {
          red: '0',
          alpha: '1.000',
          blue: '0',
          green: '0'
        }
      }
    }
  ]
};

/**
 * A struct to define an adaptive image set.
 */
const imageStruct = {
  idiom: 'universal',
  filename: '',
  scale: '1x',
  appearances : [
    {
      appearance: 'luminosity',
      value: 'dark'
    }
  ]
};

/**
 * Converts a color from the hex-space to the RGB space.
 * 
 * CREDITS: https://stackoverflow.com/a/5624139/5537752
 * 
 * @param {String} hex The hex color to use
 * @returns {Object} An object of the RGB color, represented by it's "r", "g" and "b" keys.
 */
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function sha1(value) {
	return crypto.createHash('sha1').update(value).digest('hex');
}

/**
 * Rewrite native iOS extension plist if app version changes.
 *
 * @param _logger The logger instance.
 * @param _config The config instance.
 * @param cli The CLI instance.
 * @param appc The Appc-CLI instance.
 */
exports.init = function(_logger, _config, cli, appc) {
  cli.addHook('build.pre.build', function(build, finished) {
    triggered = true;

    const colorsFile = path.resolve('./Resources/iphone/json/colors.json');
    const assetCatalogFile = path.resolve('./build/iphone/Assets.xcassets');

    if (!fs.existsSync(colorsFile) || !fs.existsSync(assetCatalogFile)) {
      finished();
      return;
    }

    // Generate semantic colors
    const colors = JSON.parse(fs.readFileSync(colorsFile, 'utf-8'));

    for (const color of Object.keys(colors)) {
      const colorDir = path.join(assetCatalogFile, `${color}.colorset`);
      const colorSource = Object.assign({}, colorStruct);
      const colorValue = colors[color];

      const defaultRGB = hexToRgb(colorValue.default || colorValue.light);
      const lightRGB = hexToRgb(colorValue.light);
      const darkRGB = hexToRgb(colorValue.dark);

      // Default
      colorSource.colors[0].color.components = {
        red: `${defaultRGB.r}`,
        green: `${defaultRGB.g}`,
        blue: `${defaultRGB.b}`,
        alpha: '1.000'
      };

      // Light
      colorSource.colors[1].color.components = {
        red: `${lightRGB.r}`,
        green: `${lightRGB.g}`,
        blue: `${lightRGB.b}`,
        alpha: '1.000'
      };

      // Dark
      colorSource.colors[2].color.components = {
        red: `${darkRGB.r}`,
        green: `${darkRGB.g}`,
        blue: `${darkRGB.b}`,
        alpha: '1.000'
      };

      fs.mkdirSync(colorDir);
      fs.writeFileSync(path.join(colorDir, 'Contents.json'), JSON.stringify(colorSource, null, '\t'));
    }

    // Generate semantic images

    const imagesPath = path.resolve('./Resources/iphone/images');

    if (!fs.existsSync(imagesPath)) {
      finished();
      return;
    }

    const imageNames = fs.readdirSync(imagesPath);

    for (const image of imageNames) {
      const filename = image.split('.').slice(0, -1).join('.')
      const extension = image.split('.').pop();
      const hash = sha1(`images/${filename}.${extension}`);
      const baseAssetName = `${sha1(`images/${filename.replace('-dark', '').replace('@2x', '').replace('@3x', '')}.${extension}`)}.imageset`;
      const baseAssetPath = path.join(assetCatalogFile, baseAssetName);

      // Skip all non-assets
      if (!image.match(/^(.*?)(@[23]x)?(~iphone|~ipad)?\.(png|jpg)$/)) continue;

      // Copy over dark images to base directory
      if (filename.indexOf('-dark') !== -1) {
        fs.copyFileSync(path.resolve('./Resources/iphone/images/' + image), path.join(assetCatalogFile, baseAssetName, image));
      }

      // Skip hi-res images for raw filename checks
      if (image.indexOf('@2x') !== -1 || image.indexOf('@3x') !== -1) {
        continue;
      }

      // Update asset catalog reference
      if (fs.existsSync(baseAssetPath)) {
        const catalogEntryContentsPath = path.join(baseAssetPath, 'Contents.json');
        const catalogEntryContents = JSON.parse(fs.readFileSync(catalogEntryContentsPath, 'utf-8'));

        let changed = false;

        // Set non-retina values
        if (imageNames.includes(`${filename}-dark.${extension}`)) {
          const data = Object.assign({}, imageStruct);
          data.scale = '1x';
          data.filename = `${filename}-dark.${extension}`;
          catalogEntryContents.images.push(data);
          changed = true;
        }
        
        // Set @2x retina values
        if (imageNames.includes(`${filename}-dark@2x.${extension}`)) {
          const data = Object.assign({}, imageStruct);
          data.scale = '2x';
          data.filename = `${filename}-dark@2x.${extension}`;
          catalogEntryContents.images.push(data);
          changed = true;
        }

        // Set @3x retina values
        if (imageNames.includes(`${filename}-dark@3x.${extension}`)) {
          const data = Object.assign({}, imageStruct);
          data.scale = '3x';
          data.filename = `${filename}-dark@3x.${extension}`;
          catalogEntryContents.images.push(data);
          changed = true;
        }

        // If something changed, update the base asset catalog entry
        if (changed) {
          fs.writeFileSync(catalogEntryContentsPath, JSON.stringify(catalogEntryContents, null, '\t'));
          continue;
        }
      }
    }

    finished();
  });
};
