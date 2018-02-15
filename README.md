## Lndry - If it's shakin', it's taken

Real-time, scalable, non-crowdsourced washer and dryer availability statuses for laundromats at RIT and beyond.

[**Read the DevPost for more info!**](https://devpost.com/software/lndry)

Made in under 24 hours for BrickHack4 at the Rochester Institute of Technology.

## Installation of frontend

1a) NativeBase library (http://docs.nativebase.io/docs/GetStarted.html)
- See 'System Requirements'
- Globally installed node >= 6.0
- Globally installed npm >= 4.0
- lobally installed React Native CLI

1b) NativeBase vector icons
```
- npm install react-native-vector-icons --save
```

2) React Native Search Filter (https://www.npmjs.com/package/react-native-search-filter)
```
- $ npm install react-native-search-filter --save
```

[Video demo of Rasp Pi sensitivity](https://github.com/zbanack/laundry/blob/master/Laundry/Showcasing/unit_test.MOV?raw=true)

![Timelapse of frontend dev, GUI](https://github.com/zbanack/laundry/blob/master/Laundry/Showcasing/lndry-progress.gif?raw=true)

## Installation on PI

_disclaimer:_ I wrote this in 24 hours. It is not perfect.

* Clone to directory using 
```
git clone https://github.com/zbanack/laundry
```
* run setup.sh in "pi/". This will install apache2, set it to run on boot, then it will add the sensor script to your rc.local file.
```
cd pi/
sudo bash setup.sh
```
* It will then reboot and be functional. To access the data, connect to the web server on the pi.
