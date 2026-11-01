const pool = require('../config/db');

class ParkingService {
  async getSlots() {
    const result = await pool.query('SELECT * FROM parking_slots');
    return result.rows;
  }

  async checkIn(vehicleNumber, slotId, io) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const slotCheck = await client.query('SELECT * FROM parking_slots WHERE id = $1 FOR UPDATE', [slotId]);
      if (slotCheck.rows.length === 0) {
        throw new Error('Slot not found');
      }
      if (slotCheck.rows[0].status !== 'AVAILABLE') {
        throw new Error('Slot is not available');
      }

      await client.query("UPDATE parking_slots SET status = 'OCCUPIED' WHERE id = $1", [slotId]);

      const ticketUuid = 'TKT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const ticketResult = await client.query(
        'INSERT INTO tickets (ticket_uuid, slot_id, vehicle_number, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [ticketUuid, slotId, vehicleNumber, 'ACTIVE']
      );

      await client.query('COMMIT');

      if (io) {
        io.emit('slotUpdate', { slotId, status: 'OCCUPIED' });
      }

      return ticketResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async checkOut(ticketUuid, io) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const ticketRes = await client.query('SELECT * FROM tickets WHERE ticket_uuid = $1 AND status = $2 FOR UPDATE', [ticketUuid, 'ACTIVE']);
      if (ticketRes.rows.length === 0) {
        throw new Error('Active ticket not found');
      }
      const ticket = ticketRes.rows[0];

      const checkOutTime = new Date();
      const checkInTime = new Date(ticket.check_in_time);
      const durationHours = Math.max(1, Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60)));
      const hourlyRate = 5.00;
      const fee = durationHours * hourlyRate;

      await client.query('UPDATE tickets SET check_out_time = $1, fee = $2, status = $3 WHERE id = $4', [checkOutTime, fee, 'COMPLETED', ticket.id]);
      await client.query("UPDATE parking_slots SET status = 'AVAILABLE' WHERE id = $1", [ticket.slot_id]);

      await client.query('COMMIT');

      if (io) {
        io.emit('slotUpdate', { slotId: ticket.slot_id, status: 'AVAILABLE' });
      }

      return { ...ticket, check_out_time: checkOutTime, fee, status: 'COMPLETED' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async createBooking(vehicleNumber, slotId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const slotCheck = await client.query('SELECT * FROM parking_slots WHERE id = $1 FOR UPDATE', [slotId]);
      if (slotCheck.rows.length === 0 || slotCheck.rows[0].status !== 'AVAILABLE') {
        throw new Error('Slot not available for booking');
      }

      await client.query("UPDATE parking_slots SET status = 'RESERVED' WHERE id = $1", [slotId]);

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const bookingRes = await client.query(
        'INSERT INTO bookings (slot_id, vehicle_number, expires_at, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [slotId, vehicleNumber, expiresAt, 'PENDING']
      );

      await client.query('COMMIT');
      return bookingRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ParkingService();
