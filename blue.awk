#!/bin/sh
awk '
BEGIN {
    FS=","
}
{
    if (NR==2) {mintemp=$3}
}
END {
    maxtemp=$3
    step=int(255/(0-mintemp))
    for (i=mintemp;i<=maxtemp;i++){

    if (i<0) {
	if (i==maxtemp) {
	    print i ":" 255-(i-mintemp)*step
	} else {
	    print i ":" 255-(i-mintemp)*step ","
	}
    } else {
	if (i==maxtemp) {
	    print i ":" 0
	} else {
	    print i ":" 0 ","
	}
    }
    }
}
'
