import{d as f,r as u,C as b,_ as p,o as v,aa as _,g as i,f as s,aW as m,e as a,Q as c,h as g,aX as h}from"./index.e02e0fd9.js";import{Q as x}from"./QForm.0c336d83.js";import{A as L}from"./Api.e3a65a9d.js";import{a as Q}from"./useHelpers.6f57171d.js";const V=f({name:"AgregarLaboratorio",setup(e,{emit:r}){const l=u(!1),t=u({nombre:"",abreviatura:""}),n=Q(),d=async()=>{try{l.value=!0;const{data:o}=await L.post("/laboratorios",t.value);r("getLaboratorios"),n.notify({color:"positive",message:o.msg,icon:"done"}),l.value=!1}catch(o){console.log(o),l.value=!1}};return b(t.value,(o,U)=>{t.value.nombre=o.nombre.toUpperCase(),t.value.abreviatura=o.abreviatura.toUpperCase()}),{formLaboratorio:t,onSubmit:d}}}),w=a("div",{class:"text-h6"},"Agregar Laboratorio",-1),y={class:"row q-gutter-sm justify-around"},A={class:"col-xs-12 col-sm-11"},C=a("label",null,"Descripci\xF3n:",-1),q={class:"col-xs-12 col-sm-11"},S=a("label",null,"Abreviatura:",-1),$={class:"col-xs-9 col-sm-12 flex justify-center"};function B(e,r,l,t,n,d){return v(),_(h,{style:{width:"600px","max-width":"80vw"}},{default:i(()=>[s(m,null,{default:i(()=>[w]),_:1}),s(m,null,{default:i(()=>[s(x,{onSubmit:e.onSubmit},{default:i(()=>[a("div",y,[a("div",A,[C,s(c,{modelValue:e.formLaboratorio.nombre,"onUpdate:modelValue":r[0]||(r[0]=o=>e.formLaboratorio.nombre=o),modelModifiers:{trim:!0},dense:"",filled:"",required:""},null,8,["modelValue"])]),a("div",q,[S,s(c,{modelValue:e.formLaboratorio.abreviatura,"onUpdate:modelValue":r[1]||(r[1]=o=>e.formLaboratorio.abreviatura=o),modelModifiers:{trim:!0},dense:"",filled:"",required:""},null,8,["modelValue"])]),a("div",$,[s(g,{label:"Guardar",class:"q-px-xl",type:"submit",color:"green-9"})])])]),_:1},8,["onSubmit"])]),_:1})]),_:1})}var D=p(V,[["render",B]]);export{D as A};
