'use strict';
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const imagesPath = path.resolve(__dirname, '..', `test/fixtures/images`);
const ora = require('ora');
if (!fs.existsSync(imagesPath)) {
  fs.mkdirSync(imagesPath);
}

const bitmapManipulation = require('bitmap-manipulation');

let targetColorDepth = 4;

async function createBitmap(index) {
  // Create bitmap with 1 byte per pixel to draw on
  let bitmap = new bitmapManipulation.BMPBitmap(600, 600);
  // let palette = bitmap.palette;

  // Fill image with light grey background
  bitmap.clear((index + 128) % 256);

  bitmap.drawFilledRect(10, 10, 50, 30, index, null);
  bitmap.drawFilledRect(70, 10, 50, 50, index, null, 5);
  bitmap.drawFilledRect(130, 10, 50, 40, null, index);
  bitmap.drawFilledRect(190, 10, 50, 50, index, index, 5);

  bitmap.drawEllipse(10, 70, 50, 30, index, null);
  bitmap.drawEllipse(70, 70, 50, 50, index, null, 2);
  bitmap.drawEllipse(130, 70, 50, 40, null, index);
  bitmap.drawEllipse(190, 70, 50, 50, index, index, 3);

  bitmap.changeColorDepth(targetColorDepth);

  // Draw gradient rectangle
  let overlayBitmap = new bitmapManipulation.BMPBitmap(50, 50);
  let overlayBitmapPalette = overlayBitmap.palette;
  overlayBitmapPalette.length = 0;
  for (let i = 0; i <= 0xff; i++) {
    overlayBitmapPalette.push((i << 16) | (i << 8) | i);
  }
  overlayBitmap.drawGradientRect(0, 0, overlayBitmap.width, overlayBitmap.height, 0x00, 0xff);
  overlayBitmap.changeColorDepth(targetColorDepth);
  bitmap.drawBitmap(overlayBitmap, 70, 130);

  bitmap.save(`${imagesPath}/image_${index}.bmp`);
}

module.exports = createBitmap;

if (module === require.main) {
  const {num: count} = yargs
    .option('num', {
      alias: 'n',
      description: 'number of images',
      default: 256,
      type: 'number',
      required: true,
    })
    .strict()
    .help().argv;

  const spinner = ora({text: 'bla', spinner: 'earth'});
  spinner.start();
  let i = 0;
  function run() {
    spinner.text = 'Creating image ' + i + ' of ' + count;
    createBitmap(i++);
    if (i < count) {
      setTimeout(run, 0);
    } else {
      spinner.succeed();
    }
  }
  run();
}
