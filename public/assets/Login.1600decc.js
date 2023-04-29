import{_,d as y,r as u,u as h,a as v,P as w,o as V,c as S,e as l,w as I,f as a,g as d,Q as p,h as k,i as c}from"./index.e282d9eb.js";import{u as $}from"./auth-user.b6acc30d.js";import{u as q,A as g}from"./Api.ffcf2c16.js";import{_ as B}from"./logo.80fb852d.js";import"./index.2cf0d985.js";const P=y({name:"Login",setup(){const e=u(!1),{mostrarNotify:o}=q(),t=u({email:"",password:""}),n=h();return{form:t,loading:e,onSubmit:async()=>{try{e.value=!0;const{data:{token:r}}=await g.post("/auth/login",t.value),i=$();i.setToken(r);const{claim:{user:s}}=v.read(r),{data:f}=await g.get(`/roles/getPermisos/${s.rol_id}`);let m=[];f.permisos.forEach(b=>m.push(b.nombre)),i.setPermisos(m),w.hide(),n.push("/"),e.value=!1}catch(r){console.log(r),o("warning",res.data.msg,"top"),e.value=!1,console.log(r)}},router:n}}}),Q={class:"area-login"},U=l("h1",{class:"title"},"Iniciar Sesion",-1),A={class:"login"},L=l("div",{class:"element-form"},[l("img",{src:B})],-1);function M(e,o,t,n,r,i){return V(),S("section",Q,[U,l("div",A,[L,l("form",{onSubmit:o[2]||(o[2]=I((...s)=>e.onSubmit&&e.onSubmit(...s),["prevent"])),class:"element-form"},[a(p,{"label-color":"blue-grey-3",class:"q-mb-lg","bg-color":"blue-grey-10",filled:"",label:"Ingresa tu email",modelValue:e.form.email,"onUpdate:modelValue":o[0]||(o[0]=s=>e.form.email=s),modelModifiers:{trim:!0},required:""},{prepend:d(()=>[a(c,{name:"person",color:"blue-grey-3"})]),_:1},8,["modelValue"]),a(p,{type:"password","label-color":"blue-grey-3",filled:"","bg-color":"blue-grey-10",label:"Ingresa tu contrase\xF1a",modelValue:e.form.password,"onUpdate:modelValue":o[1]||(o[1]=s=>e.form.password=s),modelModifiers:{trim:!0},required:""},{prepend:d(()=>[a(c,{name:"key",color:"blue-grey-3"})]),_:1},8,["modelValue"]),a(k,{label:"Ingresar",class:"q-px-xl",loading:e.loading,type:"submit",color:"deep-purple-6"},null,8,["loading"])],32)])])}var T=_(P,[["render",M]]);export{T as default};
