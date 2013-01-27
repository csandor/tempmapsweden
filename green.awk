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
step=int(255/(maxtemp-mintemp))
for (i=mintemp;i<=maxtemp;i++){
if (i==maxtemp) {
    print i ":" 0
} else {
    print i ":" 0 ","
}
}
}
'
