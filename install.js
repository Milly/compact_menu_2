const kDisplayName = "Compact Menu";
const kName = "compact";
const kPackage = "/cdn.mozdev.org/compact";
const kVersion = "1.7.2 2004-11-27";

const kJarFile = "compact.jar";
const kContentFolder = "content/compact/";
const kLocaleFolders = ['locale/en-US/compact/', 'locale/de-DE/compact/', 'locale/fr-FR/compact/', 'locale/it-IT/compact/', 'locale/ja-JP/compact/', 'locale/nl-NL/compact/', 'locale/sv-SE/compact/'];
const kSkinFolder  = "skin/classic/compact/";

var kMsg = "Do you wish to install "+kDisplayName+" to your profile?\n\nClick OK to install to your profile.\n\nClick Cancel if you want to install globally.";

initInstall(kName, kPackage, kVersion);

var chromef = getFolder("chrome");
var pchromef = getFolder("Profile", "chrome");


var existsInApp     = File.exists(getFolder(chromef,  kJarFile));
var existsInProfile = File.exists(getFolder(pchromef, kJarFile));

var instToProfile = !existsInApp && (existsInProfile || confirm(kMsg));

var folder = instToProfile ? pchromef : chromef;
var flag = instToProfile ? PROFILE_CHROME : DELAYED_CHROME;

var err = addFile(kPackage, kVersion, 'chrome/' + kJarFile, folder, null)

if(err == SUCCESS) {
  var jar = getFolder(folder, kJarFile);

  registerChrome(CONTENT | flag, jar, kContentFolder);
  for(var i = 0; i < kLocaleFolders.length; i++)
    registerChrome(LOCALE | flag, jar, kLocaleFolders[i]);
  if(kSkinFolder) registerChrome(SKIN | flag, jar, kSkinFolder);

  err = performInstall();

  if(err!=SUCCESS && err!=999) {
    alert("Install failed. Error code:" + err);
    cancelInstall(err);
  }
} else {
  alert("Failed to create " +kJarFile +"\n"
    +"You probably don't have appropriate permissions \n"
    +"(write access to firebird/chrome directory). \n"
    +"_____________________________\nError code:" + err);
  cancelInstall(err);
}
