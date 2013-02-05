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
    step=int(255/(maxtemp-0))
    for (i=mintemp;i<=maxtemp;i++){

    if (i>0) {
	if (i==maxtemp) {
	    print i ":" (i)*step
	} else {
	    print i ":" (i)*step ","
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
