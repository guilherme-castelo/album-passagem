const bcrypt = require('bcryptjs');
const userRepository = require('./userRepository');

class UserService {
  async list() {
    return userRepository.findAll();
  }

  async create(username, password) {
    if (!username || !password) throw new Error('Username e senha são obrigatórios.');
    if (password.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres.');

    const existing = await userRepository.findByUsername(username);
    if (existing) throw new Error(`Usuário "${username}" já existe.`);

    const hashed = await bcrypt.hash(password, 12);
    return userRepository.create({ username, password: hashed });
  }

  async update(id, username, password) {
    if (!username) throw new Error('Username é obrigatório.');

    const existing = await userRepository.findByUsername(username);
    // Se o username existir e for de OUTRO usuário (ID diferente)
    if (existing && existing._id.toString() !== id) {
      throw new Error(`Usuário "${username}" já existe.`);
    }

    const data = { username };
    if (password) {
      if (password.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres.');
      data.password = await bcrypt.hash(password, 12);
    }

    return userRepository.update(id, data);
  }

  async delete(id) {
    const deleted = await userRepository.delete(id);
    if (!deleted) throw new Error('Usuário não encontrado.');
    return { deleted: true };
  }
}

module.exports = new UserService();
