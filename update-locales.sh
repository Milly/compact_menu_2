#!/bin/sh

# mode: tar or empty or skip
mode=$1
extension_id=4689
domain='www.babelzilla.org'
project_dir="$(cd $(dirname "$0");pwd)"
locale_dir="$project_dir/chrome/locale"
manifest_file="$project_dir/chrome.manifest"

# show help
mode=${mode:=skip}
if [ tar != $mode -a empty != $mode -a skip != $mode ]; then
    echo "Usage: ${0##*/} [mode]"
    echo "Options:"
    echo "	mode	'tar', 'empty' or 'skip'. (default: 'skip')"
    exit -1
fi

# get user and password
echo "Login to $domain"
echo -n 'Login: '
if [ -z "$BABELZILLA_USER" ]; then
    read BABELZILLA_USER
else
    echo $BABELZILLA_USER
fi
if [ -z "$BABELZILLA_PASS" ]; then
    echo -n 'Password: '
    read -s BABELZILLA_PASS
    echo ''
fi

# login
echo -n 'Logging in...'
login_data="username=$BABELZILLA_USER&passwd=$BABELZILLA_PASS&option=ipblogin&task=login"
login_url="http://$domain/index.php?option=com_ipblogin&amp;task=login"
cookies=$(wget -q -O - --save-headers --no-cache --post-data "$login_data" "$login_url" \
    | sed -n '/^Set-Cookie: /{s/^Set-Cookie: \(.[^;]*\).*/\1/;H};/<input type="submit".*value="Logout"/{g;s/^\n\+//;s/\n/;/g;p;q}')
[ -z "$cookies" ] && echo 'Failed' && exit -1
echo 'OK'

# download and extract
locales_url="http://$domain/index.php?option=com_wts&Itemid=88&type=download$mode&extension=$extension_id"
wget -O - --header "Cookie: $cookies" "$locales_url" \
    | tar zxCf "$locale_dir" -

# remove empty locale
if [ $mode == tar ]; then
    for d in "$locale_dir"/*; do
        [ en-US == ${d##*/} ] && continue
        diff -qr "$locale_dir/en-US" "$d" >/dev/null && rm -rf "$d"
    done
elif [ $mode == skip ]; then
    for d in "$locale_dir"/*; do
        [ 0 == $(find "$d" -type f | xargs wc -c | awk 'END{print $1}') ] && rm -rf "$d"
    done
fi

# update manifest
tmp_file="$TEMP/update-locales.sh.manifest"
ls "$locale_dir" \
    | sed 's#\(.*\)#locale\tcompact\t\1\tjar:chrome/compact.jar!/locale/\1/compact/#' \
    > "$tmp_file"
sed -i "/^locale\>/d;/^# locales/r $tmp_file" "$manifest_file"
rm "$tmp_file"
