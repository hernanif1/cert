import { KEY_LOCALE } from "@/lib/i18n/config";

/**
 * Runs before first paint, next to ThemeScript, for the same reason: the root
 * layout is shared by both locales and a static export cannot vary `<html lang>`
 * per route. This sets the correct `lang` from the URL, and sends a reader who
 * chose Portuguese back to the /pt-br mirror when they arrive on an English URL.
 *
 * It only ever READS storage, and it never redirects AWAY from /pt-br, so a
 * shared Portuguese link always opens in Portuguese.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SCRIPT = `(function(){try{
var b=${JSON.stringify(BASE)},p=location.pathname;
var r=b&&p.indexOf(b)===0?p.slice(b.length):p;
var pt=r==='/pt-br'||r.indexOf('/pt-br/')===0;
document.documentElement.lang=pt?'pt-BR':'en';
if(!pt&&localStorage.getItem(${JSON.stringify(KEY_LOCALE)})==='pt-br'){
location.replace(b+'/pt-br'+(r===''?'/':r)+location.search+location.hash);}
}catch(e){}})();`;

export function LocaleScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
