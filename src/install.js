const APP_NAME			= "Sage";
const APP_CHROME_NAME		= "sage";
const APP_VERSION		= "1.2.2";
const APP_FILE 			= "sage.jar";
const APP_CONTENTS_PATH		= "content/";
const APP_SKIN_CLASSIC_PATH	= "skin/classic/";
const APP_LOCALE_ENUS_PATH	= "locale/en-US/";
const APP_LOCALE_JAJP_PATH	= "locale/ja-JP/";
const APP_LOCALE_FRFR_PATH	= "locale/fr-FR/";
const APP_LOCALE_HUHU_PATH	= "locale/hu-HU/";
const APP_LOCALE_ITIT_PATH	= "locale/it-IT/";
const APP_LOCALE_NLNL_PATH	= "locale/nl-NL/";
const APP_LOCALE_CACA_PATH	= "locale/ca-CA/";
const APP_LOCALE_ZHTW_PATH	= "locale/zh-TW/";


initInstall(APP_NAME, APP_CHROME_NAME, APP_VERSION); 

var chromeFolder = getFolder("Current User", "chrome");
setPackageFolder(chromeFolder);
addFile(APP_NAME, "chrome/" + APP_FILE, chromeFolder, "");

var jarFolder = getFolder(chromeFolder, APP_FILE);
registerChrome(CONTENT | PROFILE_CHROME, jarFolder, APP_CONTENTS_PATH);
registerChrome(SKIN | PROFILE_CHROME, jarFolder, APP_SKIN_CLASSIC_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_ENUS_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_JAJP_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_FRFR_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_HUHU_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_ITIT_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_NLNL_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_CACA_PATH);
registerChrome(LOCALE | PROFILE_CHROME, jarFolder, APP_LOCALE_ZHTW_PATH);

var result = getLastError(); 
if(result == SUCCESS) {
	performInstall();
} else {
	cancelInstall(result);
}
