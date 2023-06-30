// PayPal Sandbox API credentials
const clientID = 'AVPfUYPoLG_CYJrqUrX-mcrJo98HlYBBvkU2XLastyOcj4U99kZ1MFZ9Z2VginOPMG8nUkJOoGoZrDGL';
const secret = 'EPJnhR38HxPrTB4Hr8gvb9kNYMd7UcD7mEWAGuEzdhlp17CkxmLWp4_TYprfQIClyjcgG12D_pwXzXdj';

// Function to obtain the access token from PayPal
async function getAccessToken() {
  try {
    const response = await axios.post('https://api-m.sandbox.paypal.com/v1/oauth2/token', null, {
      auth: {
        username: clientID,
        password: secret,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        grant_type: 'client_credentials',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error retrieving access token:', error.response.data);
    throw error;
  }
}

// Function to create a PayPal payment
async function createPayPalPayment(amount) {
  try {
    // Obtain the access token
    const accessToken = await getAccessToken();

    // Create a payment request
    const paymentResponse = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/payments/payment',
      {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        transactions: [
          {
            amount: {
              total: amount,
              currency: 'USD',
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the PayPal payment ID
    const paymentID = paymentResponse.data.id;

    // Redirect the user to the PayPal payment approval URL
    const approvalURL = paymentResponse.data.links.find((link) => link.rel === 'approval_url').href;
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

// Retrieve the total payment value from the HTML element
const totalPaymentElement = document.querySelector('div._5uqybw2');
const amountText = totalPaymentElement.querySelector('strong').textContent;
const amount = parseFloat(amountText.replace(/[^0-9.-]+/g, ''));

// Example usage: Create a PayPal payment with a dynamic amount
createPayPalPayment(amount)
  .then((paymentID) => {
    console.log('PayPal payment created with ID:', paymentID);
    // Handle the payment ID as needed in your application

    // Display success message and close the page
    document.getElementById('payment-details').style.display = 'none';
    document.getElementById('success-message').style.display = 'block';
    window.close();
  })
  .catch((error) => {
    console.error('Failed to create PayPal payment:', error);
    // Handle the error as needed in your application

    // Display error message
    document.getElementById('payment-details').style.display = 'none';
    document.getElementById('error-message').style.display = 'block';
  });
