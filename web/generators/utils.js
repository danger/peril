const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

/**
 * Input validator - ensure input is not empty.
 *
 * @param {string} name
 * @return {boolean|string}
 */
const inputRequired = name => {
  return value => (/.+/.test(value) ? true : `${name} is required`);
};

/**
 * Action `add` with custom data
 *
 * Same feature as `add` type action but with data argument.
 * Note: I don’t have implement the "file already exists" security
 *
 * @param {any} plop - plop instance
 * @param {object} action
 *   @param {string} action.path
 *   @param {string} action.templateFile
 * @param {object} data
 */
const addWithCustomData = function (plop, action, data) {
  const makeDestPath = p => path.resolve(plop.getDestBasePath(), p);
  const makeTmplPath = p => path.resolve(plop.getPlopfilePath(), p);

  return function () {
    try {
      const fileDestPath = makeDestPath(
        plop.renderString(action.path || '', data)
      );
      const template = fs.readFileSync(
        makeTmplPath(action.templateFile),
        'utf-8'
      );
      mkdirp.sync(path.dirname(fileDestPath));
      fs.writeFileSync(fileDestPath, plop.renderString(template, data));
      return `add ${fileDestPath}`;
    } catch (err) {
      return err.message;
    }
  };
};

module.exports = {inputRequired, addWithCustomData};
