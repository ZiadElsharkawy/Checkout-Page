// Retrieve the total payment value from the HTML element
const totalPaymentElement = document.querySelector('div._5uqybw2');
const amountText = totalPaymentElement.querySelector('strong').textContent;
const amount = parseFloat(amountText.replace(/[^0-9.-]+/g, ''));

// PayPal Sandbox API credentials
const clientID = 'YOUR_SANDBOX_CLIENT_ID';
const secret = 'YOUR_SANDBOX_SECRET';

// Function to create a PayPal payment
async function createPayPalPayment(amount) {
  try {
    // Authenticate the API request
    const authResponse = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', null, {
      auth: {
        username: clientID,
        password: secret
      },
      params: {
        grant_type: 'client_credentials'
      }
    });

    const accessToken = authResponse.data.access_token;

    // Create a payment request
    const paymentResponse = await axios.post('https://api.sandbox.paypal.com/v1/payments/payment', {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      transactions: [
        {
          amount: {
            total: amount,
            currency: 'USD'
          }
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract the PayPal payment ID
    const paymentID = paymentResponse.data.id;

    // Redirect the user to the PayPal payment approval URL
    const approvalURL = paymentResponse.data.links.find(link => link.rel === 'approval_url').href;
    window.location.href = approvalURL; // Redirect the user to the PayPal approval URL

    // Update the payment amount on the checkout page
    document.getElementById('payment-amount').textContent = amount;

    // Return the payment ID
    return paymentID;
  } catch (error) {
    console.error('Error creating PayPal payment:', error.response.data);
    throw error;
  }
}

// Example usage: Create a PayPal payment with a dynamic amount
createPayPalPayment(amount)
  .then(paymentID => {
    console.log('PayPal payment created with ID:', paymentID);
    // Handle the payment ID as needed in your application

    // Display success message and close the page
    document.getElementById('payment-details').style.display = 'none';
    document.getElementById('success-message').style.display = 'block';
    window.close();
  })
  .catch(error => {
    console.error('Failed to create PayPal payment:', error);
    // Handle the error as needed in your application

    // Display error message
    document.getElementById('payment-details').style.display = 'none';
    document.getElementById('error-message').style.display = 'block';
  });
