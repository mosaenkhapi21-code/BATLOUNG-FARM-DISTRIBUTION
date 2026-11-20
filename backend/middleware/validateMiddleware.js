const {
    PACKAGING_SIZES,
    PROVINCES,
    PAYMENT_METHODS,
    FRUIT_STATUSES
} = require('../config/constants');

function isPositiveId(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
}

function isPositiveInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
}

function isNonNegativeInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0;
}

function isMoney(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0;
}

function isDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isText(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isPhone(value) {
    return typeof value === 'string' && /^[+0-9][0-9\s()-]{5,24}$/.test(value.trim());
}

function badRequest(res, message) {
    return res.status(400).json({ message });
}

const validateSupplier = (req, res, next) => {
    const { business_name, contact_person, phone, province, address } = req.body;

    if (
        !isText(business_name) ||
        !isText(contact_person) ||
        !isPhone(phone) ||
        !PROVINCES.includes(province) ||
        !isText(address)
    ) {
        return badRequest(
            res,
            'Valid business name, contact person, phone, province and address are required'
        );
    }

    next();
};

const validateFruit = (req, res, next) => {
    const { fruit_name, description, status, small_price, medium_price, large_price } =
        req.body;

    if (!isText(fruit_name)) {
        return badRequest(res, 'Fruit name is required');
    }

    if (description !== undefined && typeof description !== 'string') {
        return badRequest(res, 'Description must be text');
    }

    if (status !== undefined && !FRUIT_STATUSES.includes(status)) {
        return badRequest(res, 'Invalid fruit status');
    }

    if (!isMoney(small_price) || !isMoney(medium_price) || !isMoney(large_price)) {
        return badRequest(res, 'Positive prices are required for all packaging sizes');
    }

    const prices = [Number(small_price), Number(medium_price), Number(large_price)];

    if (new Set(prices).size !== prices.length) {
        return badRequest(res, 'Each packaging size must have a different selling price');
    }

    next();
};

const validateVendor = (req, res, next) => {
    const { vendor_name, phone_number, location, registration_date } = req.body;

    if (
        !isText(vendor_name) ||
        !isPhone(phone_number) ||
        !isText(location)
    ) {
        return badRequest(res, 'Valid vendor name, phone number and location are required');
    }

    if (
        registration_date !== undefined &&
        !isDate(registration_date)
    ) {
        return badRequest(res, 'Registration date must be a valid YYYY-MM-DD date');
    }

    next();
};

const validatePurchase = (req, res, next) => {
    const { supplier_id, purchase_date, items } = req.body;

    if (!isPositiveId(supplier_id)) {
        return badRequest(res, 'A valid supplier is required');
    }

    if (!isDate(purchase_date)) {
        return badRequest(res, 'Purchase date must be a valid YYYY-MM-DD date');
    }

    if (!Array.isArray(items) || items.length === 0) {
        return badRequest(res, 'At least one purchase item is required');
    }

    const seen = new Set();

    for (const item of items) {
        const key = `${item.fruit_id}:${item.packaging_size}`;

        if (
            !isPositiveId(item.fruit_id) ||
            !isPositiveInteger(item.quantity) ||
            !isMoney(item.unit_cost) ||
            !PACKAGING_SIZES.includes(item.packaging_size)
        ) {
            return badRequest(res, 'Invalid purchase item details');
        }

        if (seen.has(key)) {
            return badRequest(
                res,
                'Duplicate fruit and packaging size combinations are not allowed'
            );
        }

        seen.add(key);
    }

    next();
};

const validateSale = (req, res, next) => {
    const { vendor_id, sale_date, payment_method, amount_paid, items } = req.body;

    if (!isPositiveId(vendor_id)) {
        return badRequest(res, 'A registered vendor is required');
    }

    if (!isDate(sale_date)) {
        return badRequest(res, 'Sale date must be a valid YYYY-MM-DD date');
    }

    if (!PAYMENT_METHODS.includes(payment_method)) {
        return badRequest(res, 'Invalid payment method');
    }

    if (
        amount_paid !== undefined &&
        (!Number.isFinite(Number(amount_paid)) || Number(amount_paid) < 0)
    ) {
        return badRequest(res, 'Amount paid cannot be negative');
    }

    if (!Array.isArray(items) || items.length === 0) {
        return badRequest(res, 'At least one sale item is required');
    }

    for (const item of items) {
        if (
            !isPositiveId(item.fruit_id) ||
            !isPositiveInteger(item.quantity) ||
            !PACKAGING_SIZES.includes(item.packaging_size)
        ) {
            return badRequest(res, 'Invalid sale item details');
        }
    }

    next();
};

const validatePayment = (req, res, next) => {
    const { payment_method, amount, payment_date } = req.body;

    if (!PAYMENT_METHODS.includes(payment_method)) {
        return badRequest(res, 'Invalid payment method');
    }

    if (!isMoney(amount)) {
        return badRequest(res, 'Payment amount must be greater than zero');
    }

    if (payment_date !== undefined && !isDate(payment_date)) {
        return badRequest(res, 'Payment date must be a valid YYYY-MM-DD date');
    }

    next();
};

const validateStockUpdate = (req, res, next) => {
    if (!isNonNegativeInteger(req.body.available_quantity)) {
        return badRequest(res, 'Available quantity must be a non-negative whole number');
    }

    next();
};

const validateId = (paramName) => (req, res, next) => {
    if (!isPositiveId(req.params[paramName])) {
        return badRequest(res, `Invalid ${paramName}`);
    }

    next();
};

const validateThreshold = (req, res, next) => {
    const threshold = req.query.threshold ?? 10;

    if (!isNonNegativeInteger(threshold)) {
        return badRequest(res, 'Threshold must be a non-negative whole number');
    }

    req.query.threshold = Number(threshold);
    next();
};

const validateDateRange = (req, res, next) => {
    const { start_date, end_date } = req.query;

    if (!isDate(start_date) || !isDate(end_date)) {
        return badRequest(res, 'Start date and end date must be valid YYYY-MM-DD dates');
    }

    if (start_date > end_date) {
        return badRequest(res, 'Start date cannot be after end date');
    }

    next();
};

module.exports = {
    validateSupplier,
    validateFruit,
    validateVendor,
    validatePurchase,
    validateSale,
    validatePayment,
    validateStockUpdate,
    validateId,
    validateThreshold,
    validateDateRange
};
