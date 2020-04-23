#!/bin/bash
# With create-react-app, a self signed (therefore invalid) certificate is generated.
# 1. Create some folder in the root of your project
# 2. Copy your valid development certificate to this folder
# 3. Copy this file to the same folder
# 4. In you package.json, under `scripts`, add `postinstall` script that runs this file.
# Every time a user runs npm install this script will make sure to copy the certificate to the 
# correct location

TARGET_LOCATION="./node_modules/webpack-dev-server/ssl/server.pem"
SOURCE_LOCATION=$(pwd)/$(dirname "../cert/server.pem")/server.pem

echo Linking ${TARGET_LOCATION} TO ${SOURCE_LOCATION}
rm -f ${TARGET_LOCATION} || true
ln -s ${SOURCE_LOCATION} ${TARGET_LOCATION}
#chmod 400 ${TARGET_LOCATION} # after 30 days create-react-app tries to generate a new certificate and overwrites the existing one. 
echo "Created server.pem symlink"