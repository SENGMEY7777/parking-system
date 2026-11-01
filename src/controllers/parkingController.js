const parkingService = require('../services/parkingService');

class ParkingController {
  getHealth(req, res) {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
  }

  async getSlots(req, res, next) {
    try {
      const slots = await parkingService.getSlots();
      res.status(200).json({ success: true, data: slots });
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req, res, next) {
    try {
      const { vehicleNumber, slotId } = req.body;
      const io = req.app.get('io');
      const ticket = await parkingService.checkIn(vehicleNumber, slotId, io);
      res.status(201).json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req, res, next) {
    try {
      const { ticketUuid } = req.body;
      const io = req.app.get('io');
      const result = await parkingService.checkOut(ticketUuid, io);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req, res, next) {
    try {
      const { vehicleNumber, slotId } = req.body;
      const booking = await parkingService.createBooking(vehicleNumber, slotId);
      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ParkingController();
