#!/usr/bin/python

from time import sleep
import smbus
import os

# Power management registers
power_mgmt_1 = 0x6b
power_mgmt_2 = 0x6c


def read_byte(bus, i2caddr, adr):
    return bus.read_byte_data(i2caddr, adr)


def read_word(bus, i2caddr, adr):
    high = bus.read_byte_data(i2caddr, adr)
    low = bus.read_byte_data(i2caddr, adr + 1)
    val = (high << 8) + low
    return val


def read_word_2c(bus, i2caddr, adr):
    val = read_word(bus, i2caddr, adr)
    if (val >= 0x8000):
        return -((65535 - val) + 1)
    else:
        return val


def main(i2caddr):
    bus = smbus.SMBus(1)
    if i2caddr is None:
        i2caddr = 0x68  # address of sensor in i2cdetect for pins 1, 3, 5, and 6
    bus.write_byte_data(i2caddr, power_mgmt_1, 0)
    maxx = -100000
    maxy = -100000
    maxz = -100000
    minx = 100000
    miny = 100000
    minz = 100000
    while (True):
        sleep(1)
        xacc = read_word_2c(bus, i2caddr, 0x3b)  # x from data sheet
        yacc = read_word_2c(bus, i2caddr, 0x3d)  # y from data sheet
        zacc = read_word_2c(bus, i2caddr, 0x3f)  # z from data sheet
        if xacc > maxx:  # Get all relevant data
            maxx = xacc
        if yacc > maxy:
            maxy = yacc
        if zacc > maxz:
            maxz = zacc
        if xacc < minx:
            minx = xacc
        if yacc < miny:
            miny = yacc
        if zacc < minz:
            minz = zacc
        os.system('clear')
        print("Current maxes: {0}\t{1}\t{2}".format(maxx, maxy, maxz))
        print("Current mins:  {0}\t{1}\t{2}".format(minx, miny, minz))


if __name__ == "__main__":
    main(None)
