import PocketBase from "pocketbase";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const { data } = await request.json();

  const url = "https://pexinxas.pockethost.io/";
  const client = new PocketBase(url);

  const adminUser = String(process.env.POCKETBASE_USER);
  const adminPassword = String(process.env.POCKETBASE_PASSWORD);

  const authData = await client.admins.authWithPassword(
    adminUser,
    adminPassword
  );

  const record = await client.collection("whatsappRequests").create(data);

  // Set up nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // your Gmail address
      pass: process.env.GMAIL_PASSWORD, // your Gmail password or app-specific password
    },
  });

  // Email options
  const mailOptions = {
    from: "Novo request",
    to: process.env.GMAIL_USER,
    subject: "New WhatsApp Request",
    text: `Link do produto:\n\n 
            ${JSON.stringify(data.productUrl).slice(1, -1)}\n\n 
          Número de telefone:\n\n 
            ${JSON.stringify(data.phone).slice(1, -1)}`,
  };

  // Send email
  transporter.sendMail(mailOptions);

  return Response.json("success")
}
