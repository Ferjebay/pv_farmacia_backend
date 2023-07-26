var printer = require("../assets/lib")
const ThermalPrinter = require('node-thermal-printer').printer;
const Types = require('node-thermal-printer').types;

const imprimirFactura = async (empresa, cliente, detalle, claveAcceso, numFactura, valoresFactura, usuario_name, fecha, hora) =>{   

    let epsonThermalPrinter = new ThermalPrinter({
        type: Types.EPSON,
        width: 40,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: "-",
    });

    epsonThermalPrinter.alignCenter();
    epsonThermalPrinter.println(`${ empresa.nombre_comercial }`);                               
    epsonThermalPrinter.println(`R.U.C.: ${ empresa.ruc }`); 

    epsonThermalPrinter.println("Dirección:"); 
    epsonThermalPrinter.println(`${ empresa.direccion_matriz }`); 

    epsonThermalPrinter.tableCustom([                                       
        { text:`Ambiente: ${ empresa.ambiente }`, align:"LEFT", width:0.5, bold: false },
        { text:"Emision: NORMAL", align:"RIGHT", width:0.5, bold: false }
    ]);
    epsonThermalPrinter.tableCustom([                                       
        { text: `Fecha: ${ fecha }`, align:"LEFT", width:0.5, bold: false },
        { text: `Hora: ${ hora }`, align:"RIGHT", width:0.5, bold: false }
    ]);

    epsonThermalPrinter.alignLeft();
    epsonThermalPrinter.println(`Num. Comprobante: ${ numFactura }`);
    epsonThermalPrinter.alignCenter();
    epsonThermalPrinter.println("Clave de Acceso:"); 
    epsonThermalPrinter.println( claveAcceso ); 

    //Datos del cliente
    epsonThermalPrinter.alignLeft();
    epsonThermalPrinter.print("Cliente: ");                               
    epsonThermalPrinter.println( cliente.cliente );     

    epsonThermalPrinter.print(`${ cliente.cliente == 'CONSUMIDOR FINAL' 
                                    ? 'Cedula' : cliente.tipo_documento }: `);                               
    epsonThermalPrinter.println( cliente.cliente == 'CONSUMIDOR FINAL' ? 
                                '9999999999999' :cliente.identificacion_cliente );  

    if ( cliente.cliente != 'CONSUMIDOR FINAL' ) {
        epsonThermalPrinter.print("Correo: ");                               
        epsonThermalPrinter.println( cliente.email );                                       
    }                            

    epsonThermalPrinter.drawLine(); 
    epsonThermalPrinter.tableCustom([                                       
        { text:"Cant.", align:"LEFT", width:0.20, bold:true },
        { text:"Producto", align:"CENTER", width:0.55, bold:true },
        { text:"Total", align:"RIGHT", cols:8, bold:true }
    ]);
    epsonThermalPrinter.drawLine(); 

    detalle.forEach((item) => {  
        let fraccionesTotales = (item.fxc * item.cant_venta) + parseInt(item.f_c) 
        epsonThermalPrinter.tableCustom([                                      
            // { text:`C:${ item.cant_venta } F:${ item.f_c }`, align:"LEFT", width:0.25, bold: false },
            { text:`F:${ fraccionesTotales }`, align:"LEFT", width:0.15, bold: false },
            { text: item.producto , align:"CENTER", width:0.6, bold: false },
            { text:`$${ item.v_total }`, align:"RIGHT", width:0.25, bold: false }
        ]);        
    });

    epsonThermalPrinter.newLine(); 
    epsonThermalPrinter.alignRight();
    epsonThermalPrinter.println(`Subtotal: $${ valoresFactura.subtotal }`);  
    epsonThermalPrinter.println(`IVA(12%): $${ valoresFactura.iva }`);  
    epsonThermalPrinter.println(`Descuento: $${ valoresFactura.descuento }`);  
    epsonThermalPrinter.println(`Total: $${ valoresFactura.total }`);  

    epsonThermalPrinter.newLine(); 
    epsonThermalPrinter.alignCenter();
    epsonThermalPrinter.println('FORMA DE PAGO');  
    epsonThermalPrinter.println('SIN UTILIZACION DEL SISTEMA FINANCIERO');  
    epsonThermalPrinter.alignLeft();
    epsonThermalPrinter.println(`Atendido Por: ${ usuario_name }`);  
    epsonThermalPrinter.alignCenter();
    epsonThermalPrinter.println('Gracias por su Compra');  
    epsonThermalPrinter.cut();   

    printer.printDirect({
        data: epsonThermalPrinter.getBuffer(),
        printer: process.env[3], // printer name, if missing then will print to default printer
        success:function(jobID){
            console.log("sent to printer with ID: "+jobID);
        },
        error:function(err){
            console.log(err);
        }
    });
}

module.exports = {
    imprimirFactura
}

