#!/usr/bin/env sh

set -eu

cd /usr/share/nginx/html

js_path=$(grep -oP '(?<=src=")index\.[a-f0-9]{8}\.js(?=")' index.html)
count=$(grep -c _RUNTIME_SERVICE_ENDPOINTS "$js_path")
echo replacing $count occurences of _RUNTIME_SERVICE_ENDPOINTS in "$js_path"
echo SERVICE_ENDPOINTS:
echo $SERVICE_ENDPOINTS
sed -i 's#"_RUNTIME_SERVICE_ENDPOINTS"#'"'$SERVICE_ENDPOINTS'#" "$js_path"
sed -i 's#"_RUNTIME_SERVICE_ENDPOINTS"#'"'$SERVICE_ENDPOINTS'#" "$js_path.map"
