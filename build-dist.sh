rsync -av . /Volumes/RAM\ Disk\ 1
cd /Volumes/RAM\ Disk\ 1
echo "RAMDISK DIR"
pwd
rm -rf dist
npm run dist
