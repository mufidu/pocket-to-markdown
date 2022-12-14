import Parser from '@postlight/parser';
import fs from 'fs';

// Get urls from file ril_export.html
const urlFile = fs.readFileSync('ril_export.html', 'utf8').split('\n');

const urls = {};

// Loop through lines in file and get URLs using regex, add URL as key and tags as value
urlFile.forEach(line => {
    // Check if line contains URL
    if (line.includes('href="')) {
        const url = line.match(/href="([^"]*)"/)[1];
        // Check if line contains tags
        if (line.includes('tags="')) {
            const tags = line.match(/tags="([^"]*)"/)[1];
            // Split tags into array
            urls[url] = tags.split(',');
        } else {
            urls[url] = [''];
        }
    }
});

// Loop through urls and parse each one
for (const [url, tags] of Object.entries(urls)) {
    Parser.parse(url, { contentType: 'markdown' }).then(result => {

        // Add title to file content
        let fileContent = '# ' + result.title + '\n\n'

        // Add tags if available
        if (tags[0] !== '') {
            fileContent += "Tags:";
            tags.forEach(tag => {
                fileContent += " #" + tag;
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

        // Write to file, put file to /articles folder
        fs.writeFileSync('articles/' + result.title + '.md', fileContent);

        console.log(result.title + ' parsed!');
    });

    // Wait 1 second before parsing next URL
    await new Promise(r => setTimeout(r, 1000));
}
