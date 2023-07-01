
import { SMTPClient } from 'emailjs';
import dotenv from 'dotenv'
import express from "express"
import getRawBody from "raw-body"
import crypto from "crypto"

dotenv.config()


const app = express()

const secretKey = process.env.SECRET_KEY_CRYPTO || ""


app.post("/new-customer", async (req, res) => {
    const hmac = req.get('X-Shopify-Hmac-Sha256')
    const encryptedBody = await getRawBody(req)
    const body = JSON.parse(encryptedBody.toString())

    const hash = crypto
    .createHmac('sha256', secretKey)
    .update(encryptedBody, 'utf8', 'hex')
    .digest('base64')
    if (hash === hmac) {
        console.log(body)
        const client = new SMTPClient({
            user: process.env.SMTP_USER,
            password: process.env.SMTP_PASSWORD,
            host: process.env.SMTP_HOST,
            ssl: true,
            port: 465
        });
    
        try {
            const message = await client.sendAsync({
                text: '⌚️ De la part de l\'équipe IOAKERS, \n Tu nous fais confiance alors on tient à te remercier personnellement ! \n Voici ce code promo, FIRST10, qui te permettras d\'avoir -10% sur ta première commande.',
                from: "ioakerswatches@gmail.com",
                to: body.email ?? "matthias.cartel@gmail.com",
                subject: '🤩 Pour te remercier de ta fidélité !',
                
            });
            console.log(message);
        } catch (err) {
            console.error(err);
        }
        res.send(req.body)
      } else {
        console.log('Danger! Not from Shopify!')
        res.sendStatus(403)
      }

})

app.listen(8081, function () {
    console.log("Example app listening at http://localhost:8081")
 })