/**
 * User Model / Database Operations
 */

const { query } = require('../config/db');

const userModel = {
  async findByEmail(email) {
    const users = await query(
      'SELECT id, name, email, password_hash, role, phone, department, student_id_number, created_at, updated_at FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    return users[0] || null;
  },

  async findById(id) {
    const users = await query(
      'SELECT id, name, email, role, phone, department, student_id_number, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  },

  async createUser({ name, email, password_hash, role = 'STUDENT', phone = null, department = null, student_id_number = null }) {
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, department, student_id_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role, phone, department, student_id_number]
    );
    return result.insertId;
  },

  async updateProfile(id, { name, phone, department, student_id_number }) {
    await query(
      `UPDATE users 
       SET name = ?, phone = ?, department = ?, student_id_number = ? 
       WHERE id = ?`,
      [name.trim(), phone || null, department || null, student_id_number || null, id]
    );
    return this.findById(id);
  },

  async updatePassword(id, password_hash) {
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
  },

  async getAllUsers(roleFilter = null, search = null) {
    let sql = `SELECT id, name, email, role, phone, department, student_id_number, created_at 
               FROM users WHERE 1=1`;
    const params = [];

    if (roleFilter) {
      sql += ` AND role = ?`;
      params.push(roleFilter);
    }

    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR department LIKE ? OR student_id_number LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    sql += ` ORDER BY created_at DESC`;
    return await query(sql, params);
  },

  async deleteUser(id) {
    return await query('DELETE FROM users WHERE id = ?', [id]);
  }
};

module.exports = userModel;
