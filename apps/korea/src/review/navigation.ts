import { useMemo, useSyncExternalStore } from 'react';
const subscribe=(callback:()=>void)=>{window.addEventListener('popstate',callback);return()=>window.removeEventListener('popstate',callback);};
export function usePathname(){return useSyncExternalStore(subscribe,()=>location.pathname,()=>'/');}
export function useRouter(){return useMemo(()=>({push(path:string){const url=new URL(path,location.href);if(url.origin!==location.origin)throw Error('Review navigation must stay on this site');location.assign(url.href);}}),[]);}
