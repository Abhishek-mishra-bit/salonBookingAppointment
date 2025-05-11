// SweetAlert2 helper functions
function showToast(title, icon = 'success') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'colored-toast'
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
  
  Toast.fire({
    icon: icon,
    title: title
  });
}

function showError(title, text = '') {
  Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonColor: '#8a6d62',
    confirmButtonText: 'OK'
  });
}

async function showSuccess(title, text = '') {
  await Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    confirmButtonColor: '#9aab89',
    confirmButtonText: 'OK'
  });
}

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

          await showSuccess("Payment Successful!", "Thank you for your payment. Your booking has been confirmed.");
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
        showError("Payment Failed", response.error.description || "There was an issue processing your payment. Please try again.");
      });

    } catch (err) {
      console.error("Payment Error:", err);
      showError("Payment Error", "Something went wrong during payment. Please try again later.");
    }
  }