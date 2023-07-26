const pdf = require('html-pdf');
const path = require('path');
const fs = require('fs');
var nodemailer = require('nodemailer');

const formatInvoice = (cliente, detalle, claveAcceso, numFactura, valoresFactura) => {
    let plantilla = /*html*/`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Example 1</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js"></script>
        <style>
          .clearfix:after {
            content: "";
            display: table;
            clear: both;
          }  
          a {
            color: #5D6975;
            text-decoration: underline;
          }      
          body {
            position: relative;
            margin: 0 auto; 
            color: #001028;
            background: #FFFFFF; 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            font-family: Arial;
          }      
          .headerr {
            padding: 10px 0;
            margin-bottom: 30px;
          }      
          #logo {
            text-align: center;
            margin-bottom: 10px;
          }      
          #logo img {
            width: 140px;
          }      
          h1 {
            border-top: 1px solid  #5D6975;
            border-bottom: 1px solid  #5D6975;
            color: #5D6975;
            font-size: 2em;
            line-height: 1.4em;
            font-weight: normal;
            text-align: center;
            margin: 0 0 20px 0;
            background: url("https://res.cloudinary.com/ded0v5s09/image/upload/v1690329208/dimension_xandu4.png");
          }      
          #project {
            float: left;
          }      
          #project span {
            color: #5D6975;
            text-align: right;
            width: 52px;
            margin-right: 10px;
            display: inline-block;
            font-size: 0.8em;
          }      
          #company {
            float: right;
            text-align: right;
          }      
          #project div,
          #company div {
            white-space: nowrap;        
          }      
          table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            margin-bottom: 20px;
          }  
          table tr:nth-child(2n-1) td {
            background: #F5F5F5;
          }      
          table th,
          table td {
            text-align: center;
          }      
          table th {
            padding: 5px 20px;
            color: #5D6975;
            border-bottom: 1px solid #C1CED9;
            white-space: nowrap;        
            font-weight: normal;
          }      
          table .service,
          table .desc {
            text-align: left;
          }  
          table td {
            padding: 20px;
            text-align: right;
          }  
          table td.service,
          table td.desc {
            vertical-align: top;
          }      
          table td.unit,
          table td.qty,
          table td.total {
            font-size: 1.2em;
          }      
          table td.grand {
            border-top: 1px solid #5D6975;;
          }      
          #notices .notice {
            color: #5D6975;
            font-size: 1.2em;
          }   
        </style>
      </head>
      <body>
        <header class="clearfix">
          <div id="logo">
            <img src="https://res.cloudinary.com/ded0v5s09/image/upload/v1690329209/logo_tilhnl.png">
          </div>
          <h1>FACTURA NUM.: ${ numFactura }</h1>
          <div id="company" class="clearfix">
            <div>FARMACIA &nbsp; AGUIFARMA &nbsp; | &nbsp; R.U.C: 1206708644001</div>
            <div>Parroquia La Union Tito Mindiola y 5 de Junio</div>
            <div>+593 96 839 2095</div>
            <div><a href="mailto:company@example.com">company@example.com</a></div>
          </div>
          <div id="project">
            <div>
                <span>CLIENTE: </span> ${ cliente.cliente }
            </div>
            <div>
                <span>DIRECCIÓN: </span>
                ${ cliente.direccion_cliente }
            </div>
            <div><span>EMAIL: </span>${ cliente.email }</div>
            <div>
                <span>
                    ${ cliente.tipo_documento == '04' ? 
                        'RUC' : 'Cedula' }:                 
                </span>${ cliente.identificacion_cliente }
            </div>
          </div>
        </header>
    
        <div style="text-align: center;">
          <h3 style="text-align: center;margin-bottom: 0px;">CLAVE DE ACCESO:</h3>  
          <svg id="barcode"></svg>
        </div>
    
        <br>
        <main>
          <table>
            <thead>
              <tr>
                <th class="service">Cod. Principal</th>
                <th class="desc">Descripción</th>
                <th style="text-align: center">Cant. Fracciones</th>
                <th>Precio Unit</th>
                <th>Dscto</th>
                <th style="text-align: center">
                    Precio Total
                </th>
              </tr>
            </thead>
            <tbody>`
    detalle.forEach(a => {

        var fracciones_total = ( parseInt(a.cant_venta) * parseInt(a.fxc)) + parseInt(a.f_c);

        plantilla += /*html*/`
            <tr>
                <td class="service">${ a.cod_barra }</td>
                <td class="desc">${ a.producto }</td>
                <td class="unit" style="text-align: center">
                  ${ fracciones_total }
                </td>
                <td class="qty">$${ a.p_unit }</td>
                <td class="qty">${ a.descuento }%</td>
                <td class="total" style="text-align: center">
                    $${ a.v_total }
                </td>
            </tr>`
    });    
        

    plantilla += /*html*/`<tr>
                <td colspan="5">SUBTOTAL:</td>
                <td class="total">$${ valoresFactura.subtotal }</td>
              </tr>
              <tr>
                <td colspan="5">IVA(12%):</td>
                <td class="total">$${ valoresFactura.iva }</td>
              </tr>
              <tr>
                <td colspan="5">TOTAL DESCUENTO:</td>
                <td class="total">$${ valoresFactura.descuento }</td>
              </tr>
              <tr>
                <td colspan="5" class="grand total">TOTAL</td>
                <td class="grand total">$${ valoresFactura.total }</td>
              </tr>
            </tbody>
          </table>
          <!-- <div id="notices">
            <div>NOTICE:</div>
            <div class="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
          </div> -->
        </main>
    
        <script>
          JsBarcode("#barcode", 
          '${ claveAcceso }', 
          {
            format: "CODE128",
            height: 60,
            width: 1,
            fontSize: 13,
            margin: 5
          });
        </script>
    
      </body>
    </html>`

    return plantilla;
}

const createInvoicePDF = ( cliente, detalle, claveAcceso, numFactura, valoresFactura, pathXML ) => {

    const content = formatInvoice(cliente, detalle, claveAcceso, numFactura, valoresFactura);    

    const pathPDF = path.resolve(__dirname, `../assets/SRI/PDF/${ claveAcceso }.pdf`);

    const options = { 
        "border": {
            "top": "12px",           
            "right": "50px",
            "bottom": "12px",
            "left": "50px"
        }, 
    };

    pdf.create(content, options).toFile(pathPDF, async function(err, res) {
        if (err){
            console.log(err);
        } else {
          const config = {
              host: 'smtp.gmail.com',
              port: 587,
              auth: { user: 'juan63sn@gmail.com', pass: 'czemtmoxklcteqqn' }
          }
      
          const message = {
              from: 'juan63sn@gmail.com',
              to: cliente.email,
              subject: "Farmacia AGUIFARMA - Factura Nro. " + numFactura,
              text: "Farmacia AGUIFARMA agradece su compra, Ha sido un gusto atenderle, esperamos que usted se sienta a gusto con la atencion brindada. Le esperamos de vuelta!\n Adjuntamos el comprobante de su compra.",
              attachments: [
                  { filename: claveAcceso +'.xml', path: pathXML },
                  { filename: claveAcceso +'.pdf', path: pathPDF }
              ]
          }
      
          const transport = nodemailer.createTransport(config);
      
          try {
              await transport.sendMail(message);
              console.log("Correo Enviado Exitosamente");      
          } catch (error) {
              console.log(error);
          } 
        }
    });
}

module.exports = {
    createInvoicePDF
}
