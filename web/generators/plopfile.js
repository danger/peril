/**
 * Plopfile generator
 *
 * https://github.com/amwmedia/plop
 */

module.exports = plop => {
  plop.load('./component-generator.js');
  plop.load('./page-generator.js');
  plop.load('./blog-post-generator.js');
};
