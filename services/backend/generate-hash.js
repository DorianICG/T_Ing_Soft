// filepath: c:\Users\doria\Documents\GitHub\T_Ing_Soft\services\backend\generate-hash.js
const bcrypt = require('bcrypt');
const saltRounds = 10; // Factor de coste (10-12 es común)
const plainPassword = 'test'; // La contraseña que quieres hashear

async function hashPassword() {
  try {
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    console.log(`Contraseña Plana: ${plainPassword}`);
    console.log(`Hash Generado:    ${hash}`);
    console.log('\nCopia el Hash Generado para usarlo en tu SQL.');
  } catch (error) {
    console.error('Error generando el hash:', error);
  }
}

hashPassword();