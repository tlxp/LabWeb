const mongoose = require('mongoose');

const notaSchema = new mongoose.Schema({
  codigoDisciplina: { 
    type: String, 
    required: [true, 'O código da disciplina é obrigatório.'] 
  },
  nomeProfessor: { 
    type: String, 
    required: [true, 'O nome do professor é obrigatório.'] 
  },
  nomeDisciplina: { 
    type: String, 
    required: [true, 'O nome da disciplina é obrigatório.'] 
  },
  nota: { 
    type: Number, 
    required: [true, 'A nota é obrigatória.'] 
  }
}, { timestamps: true });

const Nota = mongoose.model('Nota', notaSchema);

module.exports = Nota;
