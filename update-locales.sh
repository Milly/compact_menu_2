#!/bin/sh

# options {{{1

# mode: tar or empty or skip
mode=
# build_mode: 1 or empty
build_mode=

# Babelzilla options
extension_id=4689
domain='www.babelzilla.org'

project_dir="$(cd $(dirname "$0");pwd)"
source_dir="$project_dir/src"
locale_dir="$source_dir/chrome/locale"
manifest_file="$source_dir/chrome.manifest"
build_dir="$project_dir/build"
manifest_tmp="$build_dir/chrome.manifest.update-locales-$$.tmp"

# functions {{{1
raise() { echo "$1"; exit 1; }

# show help
show_help() {
    cat <<HELP
Usage: ${0##*/} [options] [mode]

Options:
	--[no-]build  : Fetch to build directory

Update modes: (for not been translated lines)
	tar   : Fill by default lang
        empty : Output empty string
        skip  : Skip lines (default)

HELP
    [ -n "$1" ] && raise "$1"
    exit 1
}

# parse options {{{1
while [ 0 -lt $# ]; do
    case "$1" in
        --build) build_mode=1;;
        --no-build) build_mode=;;
        -*) show_help "Unknown option '$1'";;
        *) [ -n "$mode" ] && show_help; mode="$1";;
    esac
    shift
done

mode=${mode:=skip}
[ tar != $mode -a empty != $mode -a skip != $mode ] && show_help "Unknown mode '$mode'"

[ -n "$build_mode" ] && locale_dir="$build_dir/${locale_dir#$source_dir/}"

[ -d "$locale_dir" ] || raise "Locales directory not found"
[ -f "$manifest_file" ] || raise "Manifest file not found"

# get user and password {{{1
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

# login {{{1
echo -n 'Logging in...'
login_data="username=$BABELZILLA_USER&passwd=$BABELZILLA_PASS&option=ipblogin&task=login"
login_url="http://$domain/index.php?option=com_ipblogin&task=login"
cookies=$(wget -q -O - --save-headers --no-cache --post-data "$login_data" "$login_url" \
    | sed -n '/^Set-Cookie: /{s/^Set-Cookie: \(.[^;]*\).*/\1/;H};/<input type="submit".*value="Logout"/{g;s/^\n\+//;s/\n/;/g;p;q}')
[ -z "$cookies" ] && raise 'Failed'
echo 'OK'

# download and extract {{{1
mv "$locale_dir/en-US" "$locale_dir/en-US.saved"
locales_url="http://$domain/index.php?option=com_wts&Itemid=88&type=download$mode&extension=$extension_id"
wget -O - --header "Cookie: $cookies" "$locales_url" \
    | tar zxCf "$locale_dir" -
rm -rf "$locale_dir/en-US"
mv "$locale_dir/en-US.saved" "$locale_dir/en-US"

# remove empty locale {{{1
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

# update manifest {{{1
rm -f "$manifest_tmp" || raise "Cannot remove tmporary file"
ls "$locale_dir" \
    | sed 's#\(.*\)#locale\tcompact\t\1\tjar:compact.jar!/locale/\1/compact/#' \
    > "$manifest_tmp"
sed -i "/^locale\>/d;/^# locales/r $manifest_tmp" "$manifest_file"
rm -f "$manifest_tmp"
