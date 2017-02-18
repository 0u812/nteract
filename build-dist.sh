rsync -av . /Volumes/RAM\ Disk
cd /Volumes/RAM\ Disk
echo "RAMDISK DIR"
pwd
rm -rf dist
npm run dist
