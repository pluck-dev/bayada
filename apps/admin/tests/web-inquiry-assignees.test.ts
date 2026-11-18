import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "@bayada/db";
import { listAssignees } from "../src/lib/queries/web";
test("CRM assignees require effective inquiry permission, including custom-role restrictions", async () => {
 const oldUsers=prisma.user.findMany, oldRoles=prisma.adminRoleDef.findMany;
 try {
  const defs=[{key:"ADMIN",isSystem:true,permissions:[]},{key:"CONTENT_MANAGER",isSystem:true,permissions:[]},{key:"CLINICAL_REVIEWER",isSystem:true,permissions:[]},{key:"PARTNER_ADMIN",isSystem:true,permissions:[]},{key:"custom_project_client",isSystem:false,permissions:["project.workspace","web.inquiries"]},{key:"custom_crm",isSystem:false,permissions:["web.inquiries"]}];
  prisma.adminRoleDef.findMany=(async()=>defs.map(d=>({...d,name:d.key,description:"QA"}))) as unknown as typeof oldRoles;
  prisma.user.findMany=(async()=>[{id:"admin",name:"Admin",email:"admin@qa.invalid",role:"ADMIN",customRoleKey:null},{id:"reviewer",name:"Reviewer",email:"review@qa.invalid",role:"CLINICAL_REVIEWER",customRoleKey:null},{id:"customer",name:"Customer",email:"client@qa.invalid",role:"STUDENT",customRoleKey:"custom_project_client"},{id:"crm",name:"CRM",email:"crm@qa.invalid",role:"STUDENT",customRoleKey:"custom_crm"}]) as unknown as typeof oldUsers;
  assert.deepEqual((await listAssignees()).map(u=>u.id),["admin","crm"]);
 } finally {prisma.user.findMany=oldUsers;prisma.adminRoleDef.findMany=oldRoles;}
});
