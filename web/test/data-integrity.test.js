/* eslint-disable no-undef, max-nested-callbacks */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const _ = require('lodash');
const authors = require('../data/author.json');

describe('data integrity', () => {
  describe('authors', () => {
    const requiredFields = ['id', 'bio', 'avatar', 'twitter', 'github'];

    authors.forEach(author => {
      describe(`${author.id}`, () => {
        // Check required fields
        requiredFields.forEach(field => {
          it(`should have ${field} field`, () => {
            expect(Object.keys(author).includes(field)).toBeTruthy();
          });
        });

        // Check if avatar image is in the repo
        it('should have avatar image in the repo', () => {
          const avatarPath = path.join('data/', author.avatar);
          expect(fs.existsSync(avatarPath)).toBeTruthy();
        });
      });
    });
  });

  describe('blog posts', () => {
    const posts = fs.readdirSync('data/blog');
    const validators = [
      {key: 'title', validator: _.isString},
      {key: 'createdDate', validator: val => _.isDate(new Date(val))},
      {key: 'updatedDate', validator: val => _.isDate(new Date(val))},
      {key: 'author', validator: val => _.map(authors, 'id').includes(val)},
      {key: 'tags', validator: _.isArray},
      {key: 'image', validator: (val, post) => fs.existsSync(`data/blog/${post}/${val}`)},
      {key: 'draft', validator: _.isBoolean}
    ];

    posts.forEach(post => {
      describe(`${post}`, () => {
        const {data} = matter.read(`data/blog/${post}/index.md`);
        validators.forEach(field => {
          it(`should have correct format for ${field.key}`, () => {
            expect(field.validator(data[field.key], post)).toBeTruthy();
          });
        });
      });
    });
  });
});
