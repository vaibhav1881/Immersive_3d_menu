const mongoose = require('mongoose');
const QRCode = require('qrcode');

const tableSchema = new mongoose.Schema({
    number: {
        type: String,
        required: [true, 'Table number is required'],
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    capacity: {
        type: Number,
        min: 1,
        default: 4
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    qrCode: {
        dataUrl: String,
        uniqueId: String
    },
    location: {
        type: String,
        enum: ['indoor', 'outdoor', 'patio', 'rooftop', 'private'],
        default: 'indoor'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generate unique table ID
tableSchema.pre('save', async function () {
    if (!this.qrCode || !this.qrCode.uniqueId) {
        const uniqueId = `${this.restaurant}-table-${this.number}-${Date.now()}`;
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const menuUrl = `${baseUrl}/menu/${this.restaurant}?table=${uniqueId}`;

        try {
            const qrDataUrl = await QRCode.toDataURL(menuUrl, {
                width: 512,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            this.qrCode = {
                dataUrl: qrDataUrl,
                uniqueId: uniqueId
            };
        } catch (error) {
            console.error('QR Code generation error:', error);
        }
    }
});

// Method to regenerate QR code
tableSchema.methods.regenerateQR = async function () {
    const uniqueId = `${this.restaurant}-table-${this.number}-${Date.now()}`;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const menuUrl = `${baseUrl}/menu/${this.restaurant}?table=${uniqueId}`;

    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 512,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    });

    this.qrCode = {
        dataUrl: qrDataUrl,
        uniqueId: uniqueId
    };

    await this.save();
    return this.qrCode;
};

tableSchema.index({ restaurant: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
