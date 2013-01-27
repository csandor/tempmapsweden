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
    step=int(200/(5-mintemp))
    for (i=mintemp;i<=maxtemp;i++){

    if (i<5) {
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
