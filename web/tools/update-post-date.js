#!/usr/bin/env node

const fs = require('fs');
const slash = require('slash');
const matter = require('gray-matter');

// Get files given by lint-staged (*.md files into staged)
process.argv.slice(3).forEach(dirtyPath => {
  // Make sure it will works on windows
  const path = slash(dirtyPath);

  // Only parse blog posts
  if (!path.includes('/data/blog/')) {
    return;
  }

  // Get file from file system and parse it with gray-matter
  const orig = fs.readFileSync(path, 'utf-8');
  const parsedFile = matter(orig);

  // Get current date and update `updatedDate` data
  const updatedDate = new Date().toISOString().split('T')[0];
  const updatedData = Object.assign({}, parsedFile.data, {updatedDate});

  // Recompose content and updated data
  const updatedContent = matter.stringify(parsedFile.content, updatedData);

  // Update file
  fs.writeFileSync(path, updatedContent, {encoding: 'utf-8'});
});
