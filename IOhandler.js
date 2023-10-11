/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */

const fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path"),
  AdmZip = require('adm-zip');


/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    // reading archives
    const zip = new AdmZip(pathIn);
    // extracts everything
    zip.extractAllToAsync(pathOut, true, (err) => {
      if (err) {
        return reject()
      }
      return resolve()
    });
  })
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
  return new Promise ((resolve, reject) => {
    fs.readdir(dir, (err, data) => {
      if (err) {
        return reject()
      }
      return resolve(data.filter(file => file.split('.').pop() === 'png'))
    })
  })
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {
  readDir(pathIn)
    .then(data => {
      for (let file of data) {
        let filename = path.parse(file).name

        // adapted from https://www.npmjs.com/package/pngjs?activeTab=readme
        fs.createReadStream(path.join(pathIn, file))
        .pipe(
          new PNG({
            filterType: 4,
          })
        )
        .on("parsed", function () {
          for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
              var idx = (this.width * y + x) << 2;

              // grayscale color
              this.data[idx] = this.data[idx]/3;
              this.data[idx + 1] = this.data[idx + 1]/3;
              this.data[idx + 2] = this.data[idx + 2]/3;

            }
          }
          this.pack()
            .pipe(fs.createWriteStream(path.join(pathOut, `${filename}_gray.png`)))
            .on("error", err => console.log(err));
        })
        .on("error", err => console.log(err));
      }
    })
};

module.exports = {
  unzip,
  readDir,
  grayScale,
};
