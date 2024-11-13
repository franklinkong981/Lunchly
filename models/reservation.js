/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** get a reservation by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, customer_id AS "customerId", start_at AS "startAt", num_guests AS "numGuests", notes 
        FROM reservations WHERE id = $1`,
      [id]
    );

    const reservation = results.rows[0];

    if (reservation === undefined) {
      const err = new Error(`No such reservation: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Reservation(reservation);
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  set numGuests(num) {
    if (num < 1) {
      const err = new Error(`There must be at least one person in the reservation.`);
      err.status = 400;
      throw err;
    }
    this._numGuests = num;
  }

  get numGuests() {
    return this._numGuests;
  }

  set startAt(startDate) {
    if (startDate instanceof Date) {
      this._startAt = startDate;
    } else {
      const err = new Error(`The startAt attribute must be a valid Date object.`);
      err.status = 400;
      throw err;
    }
  }

  get startAt() {
    return this._startAt;
  }

  set customerId(id) {
    if (this._customerId == undefined) {
      this._customerId = id;
    } else {
      const err = new Error(`You can't change a reservation's customer id once it exists.`);
      err.status = 400;
      throw err;
    }
  }

  get customerId() {
    return this._customer_id;
  }

  /** save this reservation by adding it to the database if it's new or updating its information in the database. */
  async save() {
    if (this.id == undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes) VALUES ($1, $2, $3, $4) RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET start_at=$1, num_guests=$2, notes=$3 WHERE id=$4`,
        [this.startAt, this.numGuests, this.notes, this.id]
      );
    }
  }
}


module.exports = Reservation;
