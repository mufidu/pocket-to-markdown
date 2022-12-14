import Parser from '@postlight/parser';
import fs from 'fs';

// Get url from user input
const url = process.argv[2];

Parser.parse(url, { contentType: 'markdown' }).then(result => {
    // Check if article is already parsed
    if (fs.existsSync('articles/' + result.title + '.md')) {
        console.log(result.title + ' already parsed!');
        return;
    }

    // Check if article is undefined
    if (result.title === undefined) {
        // Append to singleFailed.txt
        fs.appendFileSync('singleFailed.txt', url + '\n');
        console.log('Article is undefined!');
        return;
    }

    // Add title to file content
    let fileContent = '# ' + result.title + '\n\n'

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

    // Write to file, put file to /articles folder
    // Remove special characters from file name
    fs.writeFileSync('articles/' + result.title + '.md', fileContent);
    console.log(result.title + ' parsed!');
    
}).catch(error => {
    // Append to failed.txt
    fs.appendFileSync('failed.txt', url + '\n');
    console.log(error);
});
