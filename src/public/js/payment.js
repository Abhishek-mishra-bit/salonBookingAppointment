async function payNow() {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post("/api/payment/create-order", {
        amount: 500  
      }, {
        headers: { Authorization: token }
      });

      const { order } = res.data;

      const options = {
        key: res.data.key_id, 
        amount: order.amount,
        currency: "INR",
        name: "Salon Booking",
        description: "Service Payment",
        image:
        "https://www.creativefabrica.com/wp-content/uploads/2019/02/Money-dollar-payment-logo-vector-by-Mansel-Brist.jpg",      
        order_id: order.id,
        handler: async function (response) {
          // Confirm with server
          await axios.post("/api/payment/confirm-payment", {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            status: "success"
          });

          alert("✅ Payment Successful! Thank you.");
        },
        prefill: {
          name: "Your Name",
          email: "user@example.com"
        },
        theme: { color: "#0d6efd" }
      };

      const rzp = new Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        alert("❌ Payment failed: " + response.error.description);
      });

    } catch (err) {
      console.error("Payment Error:", err);
      alert("Something went wrong during payment.");
    }
  }