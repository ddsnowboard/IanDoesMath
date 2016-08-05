#! /bin/bash
echo "If you haven't closed all your chrome tabs before running this script, this won't work."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open -a Google\ Chrome --args --disable-web-security index.html
else 
    google-chrome --disable-web-security index.html
fi
