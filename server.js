const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'obieanidavid20@gmail.com', 
        pass: 'Joon.6077$'    
    }
    
});



// Endpoint to handle the form submission
app.post('/send-email', (req, res) => {
    const { userEmail, cartDetails, totalPrice } = req.body;

    const mailOptions = {
        from: userEmail,
        to: 'obieanidavid20@gmail.com',
        subject: 'New Order',
        text: `
            New order received!

            User Email: ${userEmail}
            Cart Details: ${cartDetails}
            Total Price: ${totalPrice}
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send('Error sending email: ' + error.message);
        }
        res.status(200).send('Email sent: ' + info.response);
    });
});

// Serve static files from 'public' directory
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${5502}`);
});