#!/bin/sh

opkg update
opkg install node npm python

mkdir /mnt/mmcblk0p1/.{npm,node-gyp,config}
ln -s /mnt/mmcblk0p1/.{npm,node-gyp,config} ~
