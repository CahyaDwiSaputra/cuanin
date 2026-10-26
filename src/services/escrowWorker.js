const { pool } = require('../db');

async function releaseOrderEscrow(client, orderId) {
  const escrowRes = await client.query(
    `SELECT * FROM escrow_records WHERE order_id = $1 AND status = 'HELD' FOR UPDATE`,
    [orderId]
  );

  if (escrowRes.rows.length === 0) {
    return { success: false, message: 'Escrow record not found or already released' };
  }

  const escrow = escrowRes.rows[0];
  const amountToRelease = Number(escrow.amount_held);
  const tenantId = escrow.tenant_id;

  await client.query(
    `UPDATE escrow_records
     SET status = 'RELEASED', released_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [escrow.id]
  );

  await client.query(
    `UPDATE orders
     SET status = 'SELESAI', completed_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [orderId]
  );

  await client.query(
    `UPDATE tenants
     SET balance_held = GREATEST(0, balance_held - $1),
         balance_active = balance_active + $1
     WHERE id = $2`,
    [amountToRelease, tenantId]
  );

  return {
    success: true,
    amountReleased: amountToRelease,
    tenantId,
    orderId
  };
}

async function confirmOrderReceipt(orderId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await releaseOrderEscrow(client, orderId);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function processAutoConfirmEscrow({ forceSimulateAll = false } = {}) {
  const client = await pool.connect();
  const summary = {
    processedCount: 0,
    totalReleased: 0,
    orderIds: []
  };

  try {
    await client.query('BEGIN');

    const query = forceSimulateAll
      ? `SELECT id FROM orders WHERE status = 'DIKIRIM' FOR UPDATE`
      : `SELECT id FROM orders WHERE status = 'DIKIRIM' AND shipped_at <= NOW() - INTERVAL '7 days' FOR UPDATE`;

    const candidateOrders = await client.query(query);

    for (const row of candidateOrders.rows) {
      const res = await releaseOrderEscrow(client, row.id);
      if (res.success) {
        summary.processedCount += 1;
        summary.totalReleased += res.amountReleased;
        summary.orderIds.push(row.id);
      }
    }

    await client.query('COMMIT');
    return summary;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function startEscrowCron(intervalMs = 3600000) {
  const timer = setInterval(async () => {
    try {
      await processAutoConfirmEscrow({ forceSimulateAll: false });
    } catch (err) {
      console.error('Escrow worker cron error:', err.message);
    }
  }, intervalMs);

  return timer;
}

module.exports = {
  releaseOrderEscrow,
  confirmOrderReceipt,
  processAutoConfirmEscrow,
  startEscrowCron
};
