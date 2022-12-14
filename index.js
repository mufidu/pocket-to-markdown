import Parser from '@postlight/parser';
import fs from 'fs';

// Remove articles folder
fs.rm('articles', { recursive: true }, (err) => {
    if (err) {
        throw err;
    }
});

// Remove failed.txt file
fs.unlink('failed.txt', (err) => {
    if (err) {
        throw err;
    }
});

// Get urls from file ril_export.html
const urlFile = fs.readFileSync('ril_export.html', 'utf8').split('\n');

const urls = {};
const failed = {};

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

// Split URLs into chunks of 5
const urlChunks = Object.entries(urls).reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 5);
    if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item);
    return resultArray;
}, []);

// Parse each URL sequentially
for (const chunk of urlChunks) {
    for (const [url, tags] of chunk) {
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
            // Remove special characters from file name
            fs.writeFileSync('articles/' + result.title + '.md', fileContent);

            console.log(result.title + ' parsed!');
        } catch (error) {
            failed[url] = tags;
            console.log(url + ' failed!');
        }
    }
}

// Write failed URLs to file
fs.writeFileSync('failed.txt', JSON.stringify(failed, null, 2));
