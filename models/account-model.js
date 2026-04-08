const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return null
  }
}

/* *****************************
* Return account data using account_id
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return null
  }
}

/* *****************************
* Update account firstname, lastname, email
* ***************************** */
async function updateAccount (account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = `UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *`
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return result.rows[0]
  } catch (error) {
    return null
  }
}

/* *****************************
* Update account password
* ***************************** */
async function updatePassword (account_password, account_id) {
  try {
    const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *`
    const result = await pool.query(sql, [account_password, account_id])
    return result.rows[0]
  } catch (error) {
    return null
  }
}

/* *****************************
* Return all accounts (no passwords)
* ***************************** */
async function getAllAccounts () {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account ORDER BY account_lastname ASC, account_firstname ASC'
    )
    return result.rows
  } catch (error) {
    return null
  }
}

/* *****************************
* Update account type by account_id
* Will not update if account is already Admin
* ***************************** */
async function updateAccountType (account_id, account_type) {
  try {
    const sql = `UPDATE account SET account_type = $1 WHERE account_id = $2 AND account_type != 'Admin' RETURNING *`
    const result = await pool.query(sql, [account_type, account_id])
    return result.rows[0] || null
  } catch (error) {
    return null
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword, getAllAccounts, updateAccountType }