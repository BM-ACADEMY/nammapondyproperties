/**
 * Generates an HTML email template for callback requests (Admin Notification)
 * @param {Object} request - The callback request data
 */
const callRequestNotificationTemplate = (request) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
        .header { background: #166aa8; color: #fff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 30px; }
        .info-item { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .label { font-size: 12px; color: #777; display: block; }
        .value { font-size: 15px; font-weight: 500; color: #222; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
        .btn { display: inline-block; padding: 12px 25px; background: #166aa8; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://nammapondyproperties.com/Logo/logo1.png" alt="Namma Pondy Properties" style="height: 50px; width: auto; margin-bottom: 10px;">
          <h1>New Callback Request</h1>
        </div>
        <div class="content">
          <p>Hello Admin,</p>
          <p>A user has requested a callback.</p>
          
          <div class="info-item">
            <span class="label">Full Name</span>
            <span class="value">${request.fullName}</span>
          </div>
          <div class="info-item">
            <span class="label">Phone Number</span>
            <span class="value">${request.phone}</span>
          </div>
          <div class="info-item">
            <span class="label">Email</span>
            <span class="value">${request.email || "N/A"}</span>
          </div>
          <div class="info-item">
            <span class="label">Category</span>
            <span class="value" style="text-transform: capitalize;">${request.category}</span>
          </div>
          <div class="info-item">
            <span class="label">Preferred Time</span>
            <span class="value">${request.preferredTime}</span>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/admin/forms/call-requests" class="btn">View in Admin Panel</a>
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

module.exports = callRequestNotificationTemplate;
