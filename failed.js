// Sometimes some articles are unable to be parsed in the first time.
// So, just run this file over and over until failed.txt is empty, 
// or until you're bored.
// I can automate this process, but I don't want to lol.

import Parser from '@postlight/parser';
import fs from 'fs';

// Get urls from file failed.txt
// failed.txt is a file containing dictionary, where key is URL and value is tags

const urlFile = fs.readFileSync('failed.txt', 'utf8');
const urls = JSON.parse(urlFile);
const failed = {};

for (const [url, tags] of Object.entries(urls)) {
    try {
        // Block until URL is parsed
        const result = await Parser.parse(url, { contentType: 'markdown' });
        
        // Check if article is already parsed
        if (fs.existsSync('articles/' + result.title + '.md')) {
            console.log(result.title + ' already parsed!');
            continue;
        }

        // Check if article is undefined
        if (result.title === undefined) {
            failed[url] = tags;
            continue;
        }

        // Add title to file content
        let fileContent = '# ' + result.title + '\n\n'

        // Add tags if available
        if (tags[0] !== '') {
            fileContent += "Tags:";
            tags.forEach(tag => {
                // Remove whitespace from tag
                tag = tag.replace(/\s/g, '');
                fileContent += " #article/" + tag;
            });
            fileContent += '\n\n';
        }

        // Add author if available
        if (result.author) {
            fileContent += result.author + ' | ';
        }

        // Add date published if available
        if (result.date_published) {
            fileContent += result.date_published.substring(0, 10) + ' | ';
        }

        // Add word count
        fileContent += result.word_count + ' words\n\n';

        // Add link to original article
        fileContent += "[Link to original article](" + url + ")\n\n";

        // Add lead image if available
        if (result.lead_image_url) {
            fileContent += "![" + result.title + "](" + result.lead_image_url + ")\n\n";
        }

        // Add content
        fileContent += result.content + '\n\n';

        // Replace relative image paths with absolute paths
        fileContent = fileContent.replaceAll("](/", "](https://" + result.domain + "/");

        // Create articles folder if it doesn't exist
        if (!fs.existsSync('articles')) {
            fs.mkdirSync('articles');
        }
        
        // Remove special characters from file name
        result.title = result.title.replace(/[^a-zA-Z0-9 ]/g, "");

        // Write to file, put file to /articles folder
        fs.writeFileSync('articles/' + result.title + '.md', fileContent);

        console.log(result.title + ' parsed!');

    } catch (error) {
        console.log(error);
        failed[url] = tags;
    }
}

// Write failed dictionary to file failed.txt
fs.writeFileSync('failed.txt', JSON.stringify(failed, null, 4));
