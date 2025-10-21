
import type { APIRoute } from "astro";


export const POST: APIRoute = async ({ request }) => {
  try {
    const { cart, total, customer } = await request.json();

    // Validaciones básicas
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Cart is empty." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!customer?.name || !customer?.email) {
      return new Response(JSON.stringify({ success: false, error: "Missing customer data." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 🧾 Construcción del mensaje
    const orderDetails = cart
      .map(
        (it) => `• ${it.name} x${it.quantity} — ₱${(it.price * it.quantity).toFixed(2)}`
      )
      .join("\n");

    const message = `
🧁 New Online Order

👤 Customer:
Name: ${customer.name}
Email: ${customer.email}
${customer.phone ? `Phone: ${customer.phone}` : ""}

🛒 Order Details:
${orderDetails}

💰 Total: ₱${total.toFixed(2)}
    `.trim();

    // Envío del correo usando MailChannels
    const mailRes = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: "nesxiweb@gmail.com" }] }],
        from: { email: "order@nesxi.com", name: "Bakery Orders" },
        subject: "🧁 New Online Order",
        content: [{ type: "text/plain", value: message }],
      }),
    });

    const responseText = await mailRes.text(); 
    console.log("📧 MailChannels response:", mailRes.status, responseText);

    if (!mailRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Mail send failed (status ${mailRes.status})`,
          details: responseText,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Todo salió bien
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ sendOrder API error:", err);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
