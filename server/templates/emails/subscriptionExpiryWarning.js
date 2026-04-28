/**
 * Generates an HTML email template for subscription expiry warning
 * @param {Object} user - The user object
 * @param {Object} subscription - The subscription object
 */
const subscriptionExpiryWarningTemplate = (user, subscription) => {
  const expiryDate = new Date(subscription.endDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
        .header { background: #e67e22; color: #fff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 30px; }
        .info-box { background: #fff9f4; border: 1px solid #ffe8d1; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .expiry-date { font-size: 24px; font-weight: bold; color: #e67e22; display: block; margin: 10px 0; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
        .btn { display: inline-block; padding: 12px 25px; background: #e67e22; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://nammapondyproperties.com/Logo/logo1.png" alt="Namma Pondy Properties" style="height: 50px; width: auto; margin-bottom: 10px;">
          <h1>Subscription Expiring Soon</h1>
        </div>
        <div class="content">
          <p>Hello ${user.name || "Valued Member"},</p>
          <p>Your subscription with Namma Pondy Properties is set to expire in <strong>7 days</strong>. To ensure uninterrupted access to premium features and property leads, please renew your plan.</p>
          
          <div class="info-box">
            <span>Expiry Date:</span>
            <span class="expiry-date">${expiryDate}</span>
            <span>Plan: ${subscription.plan?.planName || "Active Plan"}</span>
          </div>

          <p>Don't miss out on potential buyers! Renewing takes just a minute.</p>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/pricing" class="btn">Renew Subscription</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Namma Pondy Properties. All rights reserved.<br>
          This is an automated notification, please do not reply.
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = subscriptionExpiryWarningTemplate;
