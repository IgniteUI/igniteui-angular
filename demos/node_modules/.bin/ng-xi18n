#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

case `uname` in
    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
esac

if [ -x "$basedir/node" ]; then
  "$basedir/node"  "$basedir/../@angular/compiler-cli/src/extract_i18n.js" "$@"
  ret=$?
else 
  node  "$basedir/../@angular/compiler-cli/src/extract_i18n.js" "$@"
  ret=$?
fi
exit $ret
