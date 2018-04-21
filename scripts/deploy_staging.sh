echo "Installing Now"
npm install -g now

echo "Deploying"
now deploy --local-config now.staging.json --team peril --token $NOW_TOKEN --npm -d

echo "Settings the alias"
now alias --local-config now.staging.json --team peril --token $NOW_TOKEN
