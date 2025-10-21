import { defineAction } from "astro:actions";

// export const sendOrder = defineAction({
//   accept: "json",
//   handler: async ({ cart, total }) => {
//     console.log("📦 ACTION EJECUTADA >> Pedido recibido:");
//     console.log("🛒 Cart:", cart);
//     console.log("💰 Total:", total);
//     if (!cart || !Array.isArray(cart) || cart.length === 0) {
//       return { success: false, error: "Cart is empty." };
//     }

//     const orderDetails = cart
//       .map(
//         (item) =>
//           `• ${item.name} x${item.quantity} - ₱${(
//             item.price * item.quantity
//           ).toFixed(2)}`
//       )
//       .join("\n");

//     const message = `🛒 New Order\n\n${orderDetails}\n\nTotal: ₱${total.toFixed(
//       2
//     )}`;

//     try {
//       const emailResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({
//           personalizations: [{ to: [{ email: "nesxiweb@gmail.com" }] }],
//           from: { email: "order@nesxi.com", name: "Bakery Orders" },
//           subject: "New Online Order",
//           content: [{ type: "text/plain", value: message }],
//         }),
//       });

//       if (!emailResponse.ok) {
//         return { success: false, error: "Failed to send email." };
//       }

//       return { success: true };
//     } catch (err) {
//       console.error("Email error:", err);
//       return { success: false, error: "Unexpected error sending order." };
//     }
//   },
// });
// export const sendOrder = defineAction({
//   accept: "json",
//   handler: async ({ cart, total }) => {
//     console.log("🔥 Action ejecutada correctamente");
//     return { ok: true };
//   },
// });
