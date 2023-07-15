# Pocket to Markdown

This NPM package helps you to export Pocket articles to Markdown format using [Postlight Parser](https://github.com/postlight/parser/). I personally use this for importing to [Obsidian](https://obsidian.md).

Output example can be found [here](https://github.com/mufidu/pocket-to-markdown/blob/master/articles/Your%20Pocket%20journey%20starts%20now.%20Make%20the%20most%20of%20it..md).

## How to use

1. Clone this repository

```bash
git clone https://github.com/mufidu/pocket-to-markdown.git
```

1. Install the package dependencies

```bash
npm install
```

2. Download your Pocket articles as HTML from [here](https://getpocket.com/export).

3. Replace the `ril_export.html` in this folder with the downloaded file.

4. Run the script

```bash
npm start
```

6. Download the remote images (optional)

```bash
python download_images.py
```

p.s. This will make the folder size much bigger if there are a lot of images.


## Output Folder

By default, the output folder is `articles`. You can change it in `index.js` file.
## Single article export

If you want to export a single article, you can use the `singleWeb.js`. Example:

```bash
node singleWeb.js https://mufidu.com/ansosmed/
```
