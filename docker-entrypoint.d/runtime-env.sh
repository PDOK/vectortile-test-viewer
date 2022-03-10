#!/usr/bin/env sh

set -eu

cd /usr/share/nginx/html

grep -oP '(?<=src=")index\.[a-f0-9]{8}\.js(?=")' index.html > /tmp/js_path
sed -i 's#"_RUNTIME_SERVICE_ENDPOINTS"#'"'$SERVICE_ENDPOINTS'#g" "$(cat /tmp/js_path)"
