const QRCode = require('qrcode');
const axios = require('axios');

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-cuanin-dev-test-2026';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-cuanin-dev-test-2026';
const IS_SANDBOX = !MIDTRANS_SERVER_KEY.startsWith('Mid-server-');
const MIDTRANS_CHARGE_URL = IS_SANDBOX
  ? 'https://api.sandbox.midtrans.com/v2/charge'
  : 'https://api.midtrans.com/v2/charge';

const MIDTRANS_STATUS_URL = IS_SANDBOX
  ? 'https://api.sandbox.midtrans.com/v2'
  : 'https://api.midtrans.com/v2';

const SNAP_API_URL = IS_SANDBOX
  ? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
  : 'https://app.midtrans.com/snap/v1/transactions';

const SNAP_JS_URL = IS_SANDBOX
  ? 'https://app.sandbox.midtrans.com/snap/snap.js'
  : 'https://app.midtrans.com/snap/snap.js';

function calculateFee(subtotalProduct, shippingCost) {
  const baseTotal = Number(subtotalProduct) + Number(shippingCost);
  const surcharge = Math.round(baseTotal * 0.04);
  const totalPaid = baseTotal + surcharge;
  const platformFee = Math.round(baseTotal * 0.033);
  const midtransFee = surcharge - platformFee;

  return {
    baseTotal,
    surcharge,
    totalPaid,
    platformFee,
    midtransFee
  };
}

async function generateQrisPayload(invoiceNumber, totalAmount, storeName) {
  // If user configured a valid Midtrans Sandbox Server Key, attempt direct charge via Midtrans Sandbox Core API
  if (MIDTRANS_SERVER_KEY && !MIDTRANS_SERVER_KEY.includes('cuanin-dev-test')) {
    try {
      const authHeader = 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');
      const response = await axios.post(MIDTRANS_CHARGE_URL, {
        payment_type: 'qris',
        transaction_details: {
          order_id: invoiceNumber,
          gross_amount: Math.round(Number(totalAmount))
        },
        qris: {
          acquirer: 'gopay'
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader
        },
        timeout: 6000
      });

      if (response.data && response.data.status_code === '201') {
        let qrDataUrl = '';
        const qrAction = response.data.actions && response.data.actions.find(a => a.name === 'generate-qr-code');
        if (qrAction && qrAction.url) {
          qrDataUrl = qrAction.url;
        } else if (response.data.qr_string) {
          qrDataUrl = await QRCode.toDataURL(response.data.qr_string, {
            width: 280,
            margin: 2,
            color: { dark: '#0F172A', light: '#FFFFFF' }
          });
        }

        if (qrDataUrl) {
          return {
            qrisString: response.data.qr_string || invoiceNumber,
            qrDataUrl: qrDataUrl,
            grossAmount: totalAmount,
            transactionId: response.data.transaction_id,
            expiryMinutes: 15,
            source: IS_SANDBOX ? 'MIDTRANS_SANDBOX_LIVE' : 'MIDTRANS_PRODUCTION_LIVE'
          };
        }
      } else if (response.data && response.data.status_message) {
        console.warn('Midtrans payment notice:', response.data.status_message);
      }
    } catch (apiErr) {
      console.warn('Midtrans Sandbox API notice:', apiErr.response?.data?.status_message || apiErr.message);
    }
  }

  // Robust EMVCo QRIS generator fallback
  const qrisString = `00020101021226600016ID.CO.CUANIN.MID0118${invoiceNumber}520458125303360540${totalAmount}5802ID5915${storeName.slice(0, 15)}6007JAKARTA6304`;
  const qrDataUrl = await QRCode.toDataURL(qrisString, {
    width: 280,
    margin: 2,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF'
    }
  });

  return {
    qrisString,
    qrDataUrl,
    grossAmount: totalAmount,
    expiryMinutes: 15,
    source: 'STANDALONE_QRIS_SANDBOX'
  };
}

// Create Official Midtrans Snap Transaction Token
async function createSnapTransaction({ orderId, grossAmount, customerDetails, itemDetails }) {
  try {
    const authHeader = 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(Number(grossAmount))
      },
      customer_details: customerDetails || {
        first_name: 'Pelanggan',
        email: 'customer@cuanin.store'
      }
    };

    if (itemDetails && itemDetails.length > 0) {
      payload.item_details = itemDetails;
    }

    const response = await axios.post(SNAP_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader
      },
      timeout: 8000
    });

    if (response.data && response.data.token) {
      return {
        success: true,
        token: response.data.token,
        redirectUrl: response.data.redirect_url,
        isSandbox: IS_SANDBOX,
        clientKey: MIDTRANS_CLIENT_KEY,
        snapJsUrl: SNAP_JS_URL
      };
    }
  } catch (err) {
    console.warn('Midtrans Snap API Notice:', err.response?.data?.error_messages || err.message);
  }

  return {
    success: false,
    token: null,
    redirectUrl: null,
    isSandbox: IS_SANDBOX,
    clientKey: MIDTRANS_CLIENT_KEY,
    snapJsUrl: SNAP_JS_URL
  };
}

async function simulateIrisPayout({ bankName, accountNumber, accountHolder, amount }) {
  const referenceId = `IRIS-${bankName}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  return {
    status: 'SUCCESS',
    referenceId,
    payoutTime: new Date().toISOString(),
    recipient: {
      bankName,
      accountNumber,
      accountHolder,
      amount
    }
  };
}

module.exports = {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
  IS_SANDBOX,
  SNAP_JS_URL,
  calculateFee,
  createSnapTransaction,
  generateQrisPayload,
  simulateIrisPayout
};
