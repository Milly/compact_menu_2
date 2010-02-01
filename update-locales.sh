#!/bin/sh

# mode: tar or empty or skip
mode=$1
extension_id=4689
domain='www.babelzilla.org'
locale_dir="$(cd $(dirname "$0");pwd)/chrome/locale"

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

echo -n 'Logging in...'
login_data="username=$BABELZILLA_USER&passwd=$BABELZILLA_PASS&option=ipblogin&task=login"
login_url="http://$domain/index.php?option=com_ipblogin&amp;task=login"
cookies=$(wget -q -O - --save-headers --no-cache --post-data "$login_data" "$login_url" \
    | sed -n '/^Set-Cookie: /{s/^Set-Cookie: \(.[^;]*\).*/\1/;H};/<input type="submit".*value="Logout"/{g;s/^\n\+//;s/\n/;/g;p;q}')
[ -z "$cookies" ] && echo 'Failed' && exit -1
echo 'OK'

locales_url="http://$domain/index.php?option=com_wts&Itemid=88&type=download${mode:=tar}&extension=$extension_id"
wget -O - --header "Cookie: $cookies" "$locales_url" \
    | tar zxCf "$locale_dir" -
