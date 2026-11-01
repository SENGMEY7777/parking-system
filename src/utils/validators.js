const Joi = require('joi');

const checkInSchema = Joi.object({
  vehicleNumber: Joi.string().required(),
  slotId: Joi.number().integer().required(),
});

const checkOutSchema = Joi.object({
  ticketUuid: Joi.string().required(),
});

const bookingSchema = Joi.object({
  vehicleNumber: Joi.string().required(),
  slotId: Joi.number().integer().required(),
});

module.exports = {
  checkInSchema,
  checkOutSchema,
  bookingSchema,
};
