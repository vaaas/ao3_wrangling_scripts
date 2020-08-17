# Bookmarklets

## ao3 extract wrangling tags

Extracts all tags from a tag wrangling page into a text file for local searching and whatnot. Available in the browser and through a CLI, whichever you fancy best.

### How to use

1. Go to the tag listing of your desire. For example, your fandom's freeform tags.
2. Select the sorting method and the shown tags as you normally would through the table labels and filter buttons.
3. Go to the page you want to start from. If you want everything, start from the first page.
4. Activate the bookmarklet OR paste the source code in the browser console (available through F12, Ctrl+Shift+K, Ctrl+Shift+J).
5. A new tab will pop up with the names of all the tags, each in its own line. It grows as more tags are read. An alert will be shown when it's done. Copy the tags to a file and enjoy.

Progress information will be printed in the browser console. The script is rate-limitted to avoid stressing the AO3 servers too much. If you have a lot of tags it can take hours to complete and it requires a stable internet connection. Good luck.

## ao3 tags as table

Same as above, but the results are presented in a table instead for copy pasting it to a spreadsheet.

## detach characters from syns

WIP script that detaches characters from relationship tags that aren't canonical.

# Userscripts

## AO3 wrangling shortcuts

Keyboard shortcuts for the AO3's wrangling interface

### Installation

Point tampermonkey / greasemonkey / whatever you're using to [this URL](https://raw.githubusercontent.com/vaaas/ao3_wrangling_scripts/master/userscripts/ao3_wrangling_shortcuts.js). Script will also work if you inject it with Firefox's Custom Style Script. It won't interfere with your normal AO3 browsing experience.

I've been using it to wrangle for some time now and it hasn't nuked my PC but nevertheless it's provided as-is and I'm not responsible if it gives you antibiotic-resistant colon infections.

### List of bindings — Editing a tag

Binding | Behaviour
--- | ---
alt-s | commit edits
alt-e | focus synonym autocomplete bar. if the tag is already a synonym, remove the synonym and then focus the bar
alt-f | focus fandom autocomplete bar
alt-r | open works listing
alt-m | open comments page
alt-u | toggle unwrangeable checkbox
alt-i | toggle canonical checkbox
alt-c | focus characters autocomplete bar (if relationship tag)
alt-g | go to the synonym page (if exists)
alt-a | select all characters in a relationship tag (if any exist)
alt-o | open tag mergers
alt-n | focus the tag's name

### List of bindings — Tag listings

Binding | Behaviour
--- | ---
alt-s | commit mass wrangling
alt-e | focus fandom autocomplete bar
alt-j | focus next tag
alt-k | focus previous tag
alt-w | open tag editing page
alt-m | toggle current tag's mass fandom wrangling checkbox
alt-r | open works listing
alt-h | go to previous page
alt-l | go to next page
alt-o | open tag mergers
alt-c | open tag comments

### List of bindings — Tag comments
Binding | Behaviour
--- | ---
alt-s | submit comment

### List of bindings — New tag
Binding | Behaviour
--- | ---
alt-e | focus tag name
alt-i | toggle canonical
alt-f | fandom tag
alt-r | relationship tag
alt-c | character tag
alt-a | additional tag
alt-s | submit

### Changing bindings

There's no pretty GUI for changing the bindings, but you can search for "define_key" and change the second argument, which defines the key sequence. Only Alt prefixes are used by default ("A-") but you should be able to use CTRL and Shift as well ("C-" / "S-").

# Utilities

## Extract ao3 wrangling tags

Node.js version of the bookmarklet. The only package dependency is `jsdom` in order to parse and query the pages. You can install it with `npm install` or manually.

1. Go to the tag listing of your desire. For example, your fandom's freeform tags.
2. Select the sorting method and the shown tags as you normally would through the table labels and filter buttons.
3. Go to the page you want to start from. If you want everything, start from the first page.
4. Copy the URL for later use.
5. Open a terminal and change your directory to the script's location.
6. Through your browser's network tab in the developer tools, copy the contents of the `Cookie` header and save them in the `cookie` file in that directory.
7. `./extract_ao3_wrangling_tags.js THE_URL > some_file.log`

##
