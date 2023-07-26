const { response } = require('express');
const MySQL = require('../database/config');

var printer = require("../assets/lib")
const ThermalPrinter = require('node-thermal-printer').printer;
const Types = require('node-thermal-printer').types;

const imprimirTicket = async (req, res = response) =>{
   
    let epsonThermalPrinter = new ThermalPrinter({
        type: Types.EPSON,
        width: 40,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: "-",
    });

    epsonThermalPrinter.alignCenter();
    epsonThermalPrinter.println("Hello World");                               
    epsonThermalPrinter.print("Hello World"); 


    epsonThermalPrinter.print("Hello World"); 
    epsonThermalPrinter.newLine();
    epsonThermalPrinter.bold(true);

    epsonThermalPrinter.drawLine(); 

    epsonThermalPrinter.tableCustom([                                       
        { text:"Cant.", align:"LEFT", width:0.25, bold:true },
        { text:"Producto", align:"CENTER", width:0.5, bold:true },
        { text:"Total", align:"RIGHT", cols:8, bold:true }
    ]);
    epsonThermalPrinter.tableCustom([                                      
        { text:"  2", align:"LEFT", width:0.25, bold:true },
        { text:"Vaporez forte 400mg", align:"CENTER", width:0.5, bold:true },
        { text:"1.75", align:"RIGHT", cols:8, bold:true }
    ]);

    
    epsonThermalPrinter.newLine();
    epsonThermalPrinter.print("Hello World"); 
    epsonThermalPrinter.print("Hello World"); 
    epsonThermalPrinter.openCashDrawer();

    epsonThermalPrinter.alignCenter();
    epsonThermalPrinter.newLine();
    epsonThermalPrinter.println("Texto Centrado");  
    epsonThermalPrinter.newLine();
    
    // epsonThermalPrinter.partialCut();
    // epsonThermalPrinter.cut();   

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

    res.json({ msg: 'imprimiendo' })            
}

const puntos_ventasGet = async (req, res = response) => {
    const estado = req.params.estado;
    const mysql = new MySQL();

    try{
        let query = `SELECT * FROM puntos_ventas`;

        if ( estado === 'true' ) query += ` WHERE estado = 1` ;

        query += ` ORDER BY id DESC`;

        const puntos_ventas = await mysql.ejecutarQuery( query );
                
        res.json({ puntos_ventas })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const pvPost = async (req, res = response) =>{
    
    const { punto_emision, secuencia_factura, nombre, direccion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        const query = `INSERT INTO puntos_ventas(empresa_id, nombre, direccion, codigo_establecimiento, punto_emision, secuencia_factura) 
                VALUES( 1, '${ nombre }', '${ direccion }', 3, ${ punto_emision }, ${ secuencia_factura })`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "punto de venta creado" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const pvPut = async (req, res = response) =>{
    const { id, nombre, punto_emision, secuencia_factura, direccion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        let query = `UPDATE puntos_ventas SET 
            nombre        = '${ nombre }',
            direccion     = '${ direccion }',
            punto_emision = '${ punto_emision }',
            secuencia_factura = '${ secuencia_factura }' WHERE id = ${ id }`;
        
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "punto de venta editado" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const setEstado = async (req, res = response) =>{
    const { id, estado } = req.params;
    const mysql = new MySQL();

    try {
        const query = `UPDATE puntos_ventas SET estado = ${ estado } WHERE id = ${ id }`;
        console.log( query );
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Punto de Venta Actualizado" })        
    } catch (error) {
        return res.json({ msg: 'Error al eliminar al proveedor' })
    }
}

const borrarPV = async (req, res = response) =>{
    const { id } = req.params;
    const mysql = new MySQL();

    try {
        const query = `DELETE FROM puntos_ventas WHERE id = ${ id };`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Punto de Venta Eliminado Exitosamente" })        
    } catch (error) {
        res.status(500).json({ message: 'Error, este punto de venta no se puede eliminar' })
    }
}

module.exports = {
  borrarPV,
  imprimirTicket,
  puntos_ventasGet,
  pvPost,
  pvPut,
  setEstado
}