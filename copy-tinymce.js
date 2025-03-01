const fs = require('fs-extra');
const path = require('path');

// Source directory (node_modules/tinymce)
const sourceDir = path.join(__dirname, 'node_modules', 'tinymce');

// Destination directory (public/tinymce)
const destDir = path.join(__dirname, 'public', 'tinymce');

// Copy files
fs.copySync(sourceDir, destDir, {
  filter: (src) => {
    // Only copy the necessary files
    return !src.includes('node_modules') || 
           src.endsWith('.min.js') || 
           src.endsWith('.min.css') ||
           src.includes('skins') ||
           src.includes('themes') ||
           src.includes('icons');
  }
});

console.log('TinyMCE files copied successfully!');
