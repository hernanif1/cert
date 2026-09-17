import { KEY_DURABLE } from "@/lib/storage/keys";

/**
 * A blocking inline script that sets the `dark` class before first paint.
 *
 * This is the one place a render-blocking script is correct: without it,
 * dark-mode users get a white flash while React hydrates. It is not optional,
 * and it is why <html> carries suppressHydrationWarning.
 */
const SCRIPT = `(function(){try{
var s=localStorage.getItem(${JSON.stringify(KEY_DURABLE)});
var t=s?(JSON.parse(s).settings||{}).theme:'system';
var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);
document.documentElement.classList.toggle('dark',d);
}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
