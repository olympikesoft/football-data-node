const convertFloatMinutes = (value) =>{
    let conversionInHours =  Math.floor( value/60 ) + value % 60 / 100;
   return conversionInHours
 }

 module.exports = {
    convertFloatMinutes,
 }