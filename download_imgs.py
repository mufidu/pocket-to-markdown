# Download all images from all FOLDER_NAME in FOLDER_NAME folder
# and save them to FOLDER_NAME/_attachments folder.
# Then replace remote image paths with local paths.
# Usage: python download_imgs.py

import os
import urllib
import urllib.parse
import urllib.request
import re
import time
import socket

# Change this to the folder name containing your markdown files
FOLDER_NAME = "articles"

# Get all files in FOLDER_NAME folder
files = os.listdir(f'{FOLDER_NAME}')

# Loop through all files
for file in files:
    # Open file if it's a markdown file
    if not file.endswith('.md'):
        continue
    f = open(f'{FOLDER_NAME}/' + file, 'r')
    # Read file
    content = f.read()
    # Loop through all images in file (markdown syntax)
    for img in re.findall(r'!\[.*\]\((.*)\)', content):
        # Get image name, use timestamp to avoid duplicates
        name = str(time.time()) + os.path.basename(urllib.parse.urlparse(img).path)
        # Create FOLDER_NAME/_attachments folder if it doesn't exist
        if not os.path.exists(f'{FOLDER_NAME}/_attachments'):
            os.makedirs(f'{FOLDER_NAME}/_attachments')
        try:
            # Download image to FOLDER_NAME/_attachments folder
            # Use Python Requests instead of urlretrieve to avoid 403 errors
            headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
                       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                       'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
                       'Accept-Encoding': 'none',
                       'Accept-Language': 'en-US,en;q=0.8',
                       'Connection': 'keep-alive'}
            req = urllib.request.Request(img, headers=headers)
            response = urllib.request.urlopen(req)
            f = open(f'{FOLDER_NAME}/_attachments/' + name, 'wb')
            f.write(response.read())
            # Add timeout to avoid hanging
            socket.setdefaulttimeout(30)
            # Replace image path with local path
            content = content.replace(img, '_attachments/' + name)
            # Print status
            print('Downloaded ' + img + f' to {FOLDER_NAME}/_attachments/' + name)
        # Print error details
        except Exception as e:
            print('Error downloading ' + img + ': ' + str(e))
        # Sleep for 1 second to avoid rate limiting, if any
        time.sleep(1)

    # Close file
    f.close()
    # Write file
    f = open(f'{FOLDER_NAME}/' + file, 'w')
    f.write(content)
    # Close file
    f.close()
