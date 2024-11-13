/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, middleName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  set notes(val) {
    this._notes = val || "";
  }

  get notes() {
    return this._notes;
  }

  /** Return the full name of the customer. */
  get fullName() {
    return `${this.firstName} ${this.middleName || ""} ${this.lastName}`;
  } 

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",
         middle_name AS "middleName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",
         middle_name AS "middleName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /**Search for customers in database that match a search result */
  static async search(search_term) {
    const search_results = await db.query(
      `SELECT id, first_name AS "firstName", middle_name AS "middleName", last_name AS "lastName", phone, notes FROM customers WHERE first_name LIKE $1 OR last_name LIKE $1`,
      [search_term]
    );

    return search_results.rows.map(c => new Customer(c));
  }

  /** Return the top 10 customers with the most reservations, sorted by most to least number of reservations. ONLY INCLUDES customers with more than 0 reseravtions. */
  static async get_top_customers() {
    const top_customers = await db.query(
      `SELECT c.id, c.last_name AS "lastName", c.first_name AS "firstName", c.middle_name AS "middleName", c.phone, c.notes, COUNT(r.id) 
      FROM reservations AS r JOIN customers AS c ON r.customer_id = c.id
      GROUP BY c.id ORDER BY COUNT(r.id) DESC, c.last_name, c.first_name LIMIT 10`
    );

    return top_customers.rows.map(c => new Customer(c));
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, middle_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
        [this.firstName, this.middleName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, middle_name=$2, last_name=$3, phone=$4, notes=$5
             WHERE id=$6`,
        [this.firstName, this.middleName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
