
const validateSupplier = (req, res, next) => {
    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = req.body;

    if (
        !business_name ||
        !contact_person ||
        !phone ||
        !province ||
        !address
    ) {
        return res.status(400).json({
            message: 'All supplier fields are required'
        });
    }

    next();
};

module.exports = { validateSupplier };
