const { ObjectId } = require('mongodb');
function paraObjectId(valor) {
  if (!valor) return null;
  if (valor instanceof ObjectId) return valor;
  if (!ObjectId.isValid(valor)) return null;
  return new ObjectId(valor);
}
module.exports = { paraObjectId, ObjectId };
