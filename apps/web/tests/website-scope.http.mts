import assert from "node:assert/strict";
(async()=>{
 const base=process.env.WEB_TEST_URL ?? "http://127.0.0.1:3336";const results=[];
 for(const locale of ['ko','en','ja','zh']){
 for(const path of ['/shop','/auth/login','/my-page','/membership','/onboarding/paid','/platform','/employees','/smart-care','/senior-living']){
  const r=await fetch(base+'/'+locale+path,{redirect:'manual'});assert.equal(r.status,404,locale+path);results.push({path:'/'+locale+path,status:r.status});
 }
 const r=await fetch(base+'/'+locale);assert.equal(r.status,200);const html=await r.text();assert.ok(!/href="\/(ko|en|ja|zh)\/(auth|shop|my-page|membership|onboarding|platform|employees)(\/|"|\?)/.test(html));
 }
 for(const [method,path]of [['GET','/api/auth/session'],['POST','/api/auth/register'],['POST','/api/auth/password/reset']]){const r=await fetch(base+path,{method,redirect:'manual'});assert.equal(r.status,404,path);results.push({method,path,status:r.status});}
 for(const path of ['/ko/contact','/ko/faq','/ko/what-we-do','/ko/who-we-serve/users','/ko/who-we-serve/providers']){const r=await fetch(base+path);assert.equal(r.status,200,path);results.push({path,status:r.status});}
 console.log(JSON.stringify({passed:true,retiredRouteChecks:36,authApiChecks:3,retainedPageChecks:9},null,2));
})().catch(e=>{console.error(e);process.exit(1)});

