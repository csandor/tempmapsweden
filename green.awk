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
    step1=int(512/(maxtemp-0))
    step2=int(512/(0-mintemp))
    for (i=mintemp;i<=maxtemp;i++){

    if (i<mintemp/4 || i>maxtemp/4) {
	if (i==maxtemp) {
	    print i ":" 0
	} else {
	    print i ":" 0 ","
	}
    } else if (i>=mintemp/4 && i<0){
	if (i==maxtemp) {
	    print i ":" int((i-mintemp/4)*step2)
	} else {
	    print i ":" int((i-mintemp/4)*step2) ","
	}
    } else if (i<=maxtemp/4 && i>=0){
	if (i==maxtemp) {
	    print i ":" 128-i*step1
	} else {
	    print i ":" 128-i*step1 ","
	}
    }
}
}
'
