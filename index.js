
import { SMTPClient } from 'emailjs';
import dotenv from 'dotenv'
import express from "express"
import getRawBody from "raw-body"
import crypto from "crypto"

dotenv.config()

const app = express()

const secretKey = process.env.SECRET_KEY_CRYPTO


app.post("/new-customer", async (req, res) => {
    const hmac = req.get('X-Shopify-Hmac-Sha256')
    const encryptedBody = await getRawBody(req)
    const body = JSON.parse(encryptedBody.toString())

    const hash = crypto
    .createHmac('sha256', secretKey)
    .update(encryptedBody, 'utf8', 'hex')
    .digest('base64')

    if (hash === hmac) {
        const client = new SMTPClient({
            user: process.env.SMTP_USER,
            password: process.env.SMTP_PASSWORD,
            host: process.env.SMTP_HOST,
            ssl: true,
            port: 465
        });
    
        try {
            // send customized email with your favorite tool
            await client.sendAsync({
                
                text: 'This text will the body of the mail',
                from: process.env.SMTP_USER,
                to: body.email ?? process.env.SMTP_USER,
                subject: 'This text will be the title of the mail',
            });
        } catch (err) {
            console.error(err);
        }
        res.sendStatus("200")
      } else {
        console.log('Danger! Not from Shopify!')
        res.sendStatus(403)
      }

})

app.listen(8081, function () {
    console.log("Example app listening at http://localhost:8081")
 })