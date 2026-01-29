import { Injectable } from '@nestjs/common';
import * as Midtrans from 'midtrans-client';

@Injectable()
export class MidtransService {
  private snaps = new Map<string, Midtrans.Snap>();
  async createTransaction(
    userId: string,
    orderId: string,
    amount: number,
    customer: any,
    items: any[],
    serverKey: string,
    clientKey: string,
  ) {
    const cacheKey = `${userId}`;

    let snap;
    if (this.snaps.has(cacheKey)) {
      snap = this.snaps.get(cacheKey);
    } else {
      snap = new Midtrans.Snap({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
        serverKey: serverKey,
        clientKey: clientKey,
      });
      this.snaps.set(cacheKey, snap);
    }

    return await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: customer,
      item_details: items,
    });
  }

  generateSnapHtml({ token, clientKey, successUrl, pendingUrl, errorUrl }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment</title>
  <script src="https://app.sandbox.midtrans.com/snap/snap.js"
    data-client-key="${clientKey}"></script>
</head>
<body>
  <h3>Processing Payment...</h3>

  <script>
    window.snap.pay("${token}", {
      onSuccess: function(result){
        window.location.href = "${successUrl}";
      },
      onPending: function(result){
        window.location.href = "${pendingUrl}";
      },
      onError: function(result){
        window.location.href = "${errorUrl}";
      },
      onClose: function(){
        alert("Pembayaran dibatalkan");
      }
    });
  </script>
</body>
</html>
`;
  }
}
