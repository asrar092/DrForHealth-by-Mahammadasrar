export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay Checkout and returns a promise that resolves with the
 * payment response, or rejects if the user closes the modal / payment fails.
 */
export async function openRazorpayCheckout({ orderData, userEmail, userName, onSuccess, onDismiss }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Unable to load payment gateway. Please check your connection and try again.');
    return;
  }

  const options = {
    key: orderData.key,
    amount: orderData.amount,
    currency: orderData.currency,
    name: 'Dr For Health',
    description: orderData.ebookTitle,
    order_id: orderData.razorpayOrderId,
    prefill: { name: userName, email: userEmail },
    theme: { color: '#1A9E5C' },
    handler: (response) => onSuccess(response),
    modal: { ondismiss: onDismiss },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
