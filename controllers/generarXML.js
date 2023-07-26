const moment = require('moment');
const axios = require('axios');
const { execSync } = require('node:child_process');
const XMLParser = require("fast-xml-parser").XMLParser;
require('dotenv').config();
const builder = require("xmlbuilder");
const fs = require("fs");
const path = require('path');
const { createInvoicePDF } = require('./generarPDF');

const estadoXml = async (accessKey, ambiente, cliente, numFactura, items, valoresFactura) => {
    //Enviar al SRI
    let host = '';
    if (ambiente === 'PRUEBA') {
        host = 'https://celcer.sri.gob.ec';
    } else { //Si es producción
        host = 'https://cel.sri.gob.ec';
    }

   var config = {
       method: 'post',
       url: host + '/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl',
       headers: {
           'Content-Type': 'text/xml',
           'Accept': 'text/xml',
           'SOAPAction': ''
       },
       data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">' +
           '<soapenv:Header/>' +
           '<soapenv:Body>' +
           '<ec:autorizacionComprobante>' +
           '<claveAccesoComprobante>' + accessKey + '</claveAccesoComprobante>' +
           '</ec:autorizacionComprobante>' +
           '</soapenv:Body>' +
           '</soapenv:Envelope>'
   };

   let resp = null;

   try {
       resp = await axios(config);
   } catch (err) {
       console.log('error axio:', err)
   }

   if (resp !== null && resp.status === 200) {
       const parser = new XMLParser();
       const jObj = parser.parse(resp.data);

       const autorizacion = jObj['soap:Envelope']['soap:Body']['ns2:autorizacionComprobanteResponse']['RespuestaAutorizacionComprobante']['autorizaciones']['autorizacion'];

    //    console.log( resp.data );

       const estado = autorizacion['estado'];
       let directorio = ''

       if ('AUTORIZADO' === estado) {
           directorio = 'Autorizados';
       }else{
           directorio = 'NoAutorizados';

           // const mensaje = autorizacion.mensajes.mensaje.mensaje;
           // const infoAdicional = mensaje?.informacionAdicional || 'NO HAY INFO ADICIONAL'; 
       }

       try {
           const pathXML = path.resolve(__dirname, `../assets/SRI/${ directorio }/${ accessKey }.xml`);

           await fs.writeFileSync(pathXML, resp.data, {flag: 'w+', encoding: 'utf-8'})

           //GENERAR PDF Y ENVIAR CORREO
           if ( cliente.cliente != 'CONSUMIDOR FINAL' ) {
                createInvoicePDF(cliente, items, accessKey, numFactura, valoresFactura, pathXML);                           
           }
       } catch (err) {
           console.log(err)
       }
   }
}

const generarXMLFactura = async ( empresa, cliente, items, claveAcceso, numFactura, valoresFactura ) => {
    const infoTributaria = {
        ambiente: (empresa.ambiente == 'PRUEBA') ? 1 : 2,
        tipoEmision: 1,
        razonSocial: empresa.razon_social,
        ruc: empresa.ruc,
        claveAcceso: claveAcceso,
        codDoc: '01', //Factura
        estab: numFactura.split('-')[0],
        ptoEmi: numFactura.split('-')[1],
        secuencial: numFactura.split('-')[2],
        dirMatriz: empresa.direccion_matriz
    };

    //OBTENER LA SUMA DE TODOS LOS ARTICULOS QUE APLICAN IVA Y DESCUENTOS
    let sumaPrecioTotalSinImpuesto = 0;      

    items.forEach((item) => {   
        if ( item.aplicaIva == 'SI' ) {
            let subtotalSinDescuento = parseFloat( (parseInt( item.cant_venta ) * parseFloat( item.p_unit )) );
            let valorDescuento = (subtotalSinDescuento * parseInt(item.descuento)) / 100;
            
            sumaPrecioTotalSinImpuesto +=  parseFloat(subtotalSinDescuento - valorDescuento);                  
        } 
    });
    
    const infoFactura = {
        fechaEmision:                   moment().format('DD/MM/YYYY'),
        dirEstablecimiento:             empresa.direccion,
        obligadoContabilidad:           empresa.obligado_contabilidad,
        tipoIdentificacionComprador:    cliente.tipo_identificacion,
        razonSocialComprador:           cliente.cliente,
        identificacionComprador:        cliente.identificacion_cliente,
        direccionComprador:             cliente.direccion_cliente,
        totalSinImpuestos:              valoresFactura.subtotal,
        totalDescuento:                 valoresFactura.descuento,
        totalConImpuestos: { 
            totalImpuesto: {
                codigo: 2,
                codigoPorcentaje: valoresFactura.iva > 0 ? 2 : 0,
                baseImponible: valoresFactura.iva > 0 ? parseFloat(sumaPrecioTotalSinImpuesto).toFixed(2) : valoresFactura.total,
                tarifa: valoresFactura.iva > 0 ? 12 : 0,
                valor: valoresFactura.iva ? valoresFactura.iva : (0).toFixed(2)
            }
        },
        propina: 0.00,
        importeTotal: valoresFactura.total,
        moneda: 'DOLAR',
        pagos: {
            pago: {
                formaPago: '01',
                total: valoresFactura.total
            }
        }
    };

    const detalle = []
    
    items.forEach((item) => {   
        var fracciones_total = ( parseInt(item.cant_venta) * parseInt(item.fxc)) + parseInt(item.f_c);

        let subtotalSinDescuento = ( fracciones_total * parseFloat( item.p_unit ));
        
        let valorDescuento = (subtotalSinDescuento * item.descuento) / 100;

        let precioTotalSinImpuesto = (subtotalSinDescuento - valorDescuento).toFixed(2);


        detalle.push({
            codigoPrincipal: item.cod_barra,
            descripcion: item.producto,
            cantidad: fracciones_total, 
            precioUnitario: parseFloat(item.p_unit).toFixed(2),
            descuento: parseFloat(valorDescuento).toFixed(2),
            precioTotalSinImpuesto: precioTotalSinImpuesto,
            impuestos: {
                impuesto: {
                    codigo: 2,
                    codigoPorcentaje: item.aplicaIva == 'SI' ? 2 : 0,
                    tarifa: item.aplicaIva == 'SI' ? 12 : 0,
                    baseImponible: precioTotalSinImpuesto,
                    valor: item.aplicaIva == "SI" ? (precioTotalSinImpuesto * 0.12).toFixed(2) : (0).toFixed(2) //condicionar si tiene impuesto
                }
            }
        })       
    });

    const campoAdicional = [{
        '@nombre': 'Email',
        '#text': cliente.cliente == 'CONSUMIDOR FINAL' ? 'abc@gmail.com' : cliente.email
    }];

    var obj = {
        factura: {
            '@id': 'comprobante',
            '@version': "1.0.0",
            infoTributaria: infoTributaria,
            infoFactura: infoFactura,
            detalles: {
                detalle: detalle
            },
            infoAdicional: {
                campoAdicional
            }
        }
    };

    var xml = builder.create(obj, { encoding: 'UTF-8' }).end({ pretty: true});

    const pathXML = path.resolve(__dirname, `../assets/SRI/Generados/${ claveAcceso }.xml`);
    const xmlOutPath = path.resolve(__dirname, `../assets/SRI/Firmados/${ claveAcceso }.xml`);

    const java = process.env.JAVA_PATH;
    const pathCertificado = path.resolve(__dirname, `../assets/firmas/${ process.env.CERT_PATH }`);
    const contraseniaCertificado = process.env.CERT_PASS;

    try {
        await fs.writeFileSync(pathXML, xml, {flag: 'w+', encoding: 'utf-8'})
    } catch (err) {
        console.log(err)
    }
    
    try {
        await fs.writeFileSync(xmlOutPath, "", {flag: 'w+', encoding: 'utf-8'})
    } catch (err) {
        console.log(err)
    }

    const cmd = java + ' -jar "' + path.resolve('assets/resource/jar/firmaxml1 (1).jar') + '" "' + pathXML + '" "' + pathCertificado + '" "' + contraseniaCertificado + '" "' + xmlOutPath + '"';

    try {
        await execSync(cmd)
    } catch (err) {
        console.log('error firma: ', err)
    }

    let signedXml = null;

    try {
        const xmlOut = await fs.readFileSync(xmlOutPath);

        signedXml = xmlOut.toString('base64');
    } catch (err) {
        console.log('error firma: ', err)
    }

    //Enviar al SRI
    let host = '';
    if (empresa.ambiente === 'PRUEBA') {
        host = 'https://celcer.sri.gob.ec';
    } else { //Si es producción
        host = 'https://cel.sri.gob.ec';
    }

    var config = {
        method: 'post',
        url: host + '/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
        headers: {
            'Content-Type': 'text/xml',
            'Accept': 'text/xml',
            'SOAPAction': ''
        },
        data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.recepcion">' +
            '<soapenv:Header/>' +
            '<soapenv:Body>' +
            '<ec:validarComprobante>' +
            '<xml>' + signedXml + '</xml>' +
            '</ec:validarComprobante>' +
            '</soapenv:Body>' +
            '</soapenv:Envelope>'
    };

    let resp = null;

    try {
        resp = await axios(config);
    } catch (err) {
        console.log('error axio:', err)
    }

    //Leer xml de respuesta del SRI
    if (resp !== null && resp.status === 200) {
        const parser = new XMLParser();
        const jObj = parser.parse( resp.data );

        const estado = jObj['soap:Envelope']['soap:Body']['ns2:validarComprobanteResponse']['RespuestaRecepcionComprobante']['estado'];

        console.log("envio", resp.data);
        
        if ('DEVUELTA' === estado) {
            const comprobantes = jObj['soap:Envelope']['soap:Body']['ns2:validarComprobanteResponse']['RespuestaRecepcionComprobante']['comprobantes'];

            try {
                const pathXML = path.resolve(__dirname, `../assets/SRI/Devueltos/${ claveAcceso }.xml`);

                const respuestaSRI = xml.substring(0, xml.length - 10) + '\n \t' + resp.data + '\n \n</factura>';

                await fs.writeFileSync(pathXML, respuestaSRI, {flag: 'w+', encoding: 'utf-8'})
            } catch (err) {
                console.log(err)
            }

            const mensaje = comprobantes['comprobante']['mensajes']['mensaje']['mensaje'];
            const infoAdicional = mensaje?.informacionAdicional || 'NO HAY INFO ADICIONAL'

            // return console.log( infoAdicional );
        }
    }

    setTimeout(() =>{
        estadoXml( claveAcceso, empresa.ambiente, cliente, numFactura, items, valoresFactura );
    }, 3000)
}

module.exports = {
    generarXMLFactura
}
