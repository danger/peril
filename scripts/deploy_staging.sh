echo "Installing Now (if needed)"
command -v now >/dev/null 2>&1 || { npm install -g now; }

echo "Deploying"
now deploy --local-config now.staging.json --team peril --token $NOW_TOKEN

echo "Settings the alias"
now alias --local-config now.staging.json --team peril --token $NOW_TOKEN
