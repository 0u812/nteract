rsync -av . /Volumes/RAM\ Disk --exclude=dist
cd /Volumes/RAM\ Disk
echo "RAMDISK DIR"
pwd
rm -rf dist
npm run dist
