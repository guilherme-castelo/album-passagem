const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./authRepository');

class AuthService {
    async login(username, password) {
        if (!username || !password) {
            throw new Error('Usuário e senha são obrigatórios.');
        }

        const admin = await authRepository.findByUsername(username);
        if (!admin) {
            throw new Error('Credenciais inválidas.');
        }

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            throw new Error('Credenciais inválidas.');
        }

        const token = jwt.sign(
            { id: admin._id.toString(), username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return { token, username: admin.username };
    }
}

module.exports = new AuthService();
