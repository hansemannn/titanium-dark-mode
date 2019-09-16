# iOS 13+ Dark Mode in Titanium

Full support for iOS 13+ dark mode in Titanium. Works for both semantic colors and images.

<img src="./example.png" alt="Example" />

## ⚠️ Note

You should only use this plugin if you want to support dark mode with a Titanium version < 8.2.0. Titanium
8.2.0 and later added support for dark mode based on this plugin internally, so this plugin isn't needed anymore.

## The Magic

This project includes a CLI hook that generates semantic colors and images for the iOS Asset Catalog based on a JSON
file of colors that can even be used cross-platform and backwards compatible. It hooks into the SDK process
between generating the asset catalog and compiling the app, so you can even change colors between builds
without the need of clean-building the app again.

## Requirements

The following project- and OS-requirements are necessary:

- [x] Xcode 11+
- [x] Asset Catalog enabled
- [x] iOS 13+ (will fallback to `#000000` if called from older devices)
- [x] Titanium SDK 8.0.0+
- [x] A CLI plugin to hook into the asset catalog to generate the semantic colors
- [x] A JSON file to curate the color styles

## Installation

- [x] Copy the contents of the `plugin/` directory (`colors`) to `<project>/plugins`
- [x] Link the `colors` plugin in your tiapp.xml:
```xml
<ti:app>
  <!-- ... -->
  <plugins>
    <!-- ... -->
    <plugin version="1.0">colors</plugin>
  </plugins>
</ti:app>
```
- [x] Link the native `ti.darkmode` module to your project like any other native module
- [x] Alloy: Copy your color JSON file to `<project>/app/assets/json/colors.json`
- [x] Classic: Copy your color JSON file to `<project>/Resources/json/colors.json`
- [x] For semantic images, make sure they are following the following scheme (`-dark` suffix):
```sh
# Default (Light)
image.png
image@2x.png
image@3x.png

# Dark
image-dark.png
image-dark@2x.png
image-dark@3x.png
```
- [x] Map the colors on runtime for older devices or Android (this is just an example of how this could look like):
```js
function initializeColors() {
  const colors = Alloy.Globals.colors = JSON.parse(Ti.Filesystem.getFile('json/colors.json').read());
  const darkmode = OS_ANDROID ? undefined : require('ti.darkmode');

  for (const color of Object.keys(colors)) {
    Alloy.CFG.styles[color] = Utils.isiOSVersionOrGreater(13) ? darkmode.fetch(color) : colors[color].light;
  }

  // Use your colors like the following
  myLabel.backgroundColor = Alloy.CFG.styles.backgroundColor
}
```

## ToDos

- [ ] Support sub-folders
- [ ] This currently breaks incremental builds, because the Xcode project is changed after it's hash is stored

## License

MIT

## Author

Hans Knöchel
