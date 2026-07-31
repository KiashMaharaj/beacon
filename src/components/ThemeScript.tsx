/** Inline script that applies the saved theme before paint to avoid a flash. */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('beacon.theme');var d=t? t==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;
  // eslint-disable-next-line @next/next/no-sync-scripts
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
