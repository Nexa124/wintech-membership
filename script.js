const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

const PLAN_PRICES = {
  Starter: 3000,
  Plus: 5000,
  Pro: 7000,
  Premium: 11000,
};

const planSelect = document.getElementById('plan');
const signupForm = document.getElementById('signupForm');
const successMessage = document.getElementById('successMessage');

const getAmountInKobo = (planName) => (PLAN_PRICES[planName] || 0) * 100;

function handlePayment() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const plan = planSelect.value;
  const message = document.getElementById('message').value.trim();

  if (!fullName || !email || !phone || !plan) {
    alert('Please fill in your full name, email, phone number, and select a plan.');
    return;
  }

  const amount = getAmountInKobo(plan);

  if (!amount || amount <= 0) {
    alert('Please select a valid membership plan.');
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount,
    currency: 'NGN',
    ref: `wintech_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    firstname: fullName.split(' ')[0],
    lastname: fullName.split(' ').slice(1).join(' ') || 'Member',
    phone,
    metadata: {
      custom_fields: [
        {
          display_name: 'Full Name',
          variable_name: 'full_name',
          value: fullName,
        },
        {
          display_name: 'Membership Plan',
          variable_name: 'membership_plan',
          value: plan,
        },
        {
          display_name: 'Message',
          variable_name: 'message',
          value: message || 'No message provided',
        },
      ],
    },
    callback: function (response) {
      successMessage.classList.add('show');
      console.log('Paystack success:', response);
      localStorage.setItem('wintech_last_payment_ref', response.reference);
      signupForm.reset();
      planSelect.value = 'Pro';
    },
    onClose: function () {
      console.log('Payment window closed by user.');
    },
  });

  handler.openIframe();
}

document.querySelectorAll('.select-plan').forEach((button) => {
  button.addEventListener('click', () => {
    const selectedPlan = button.getAttribute('data-plan');
    const selectedAmount = button.getAttribute('data-amount');

    if (selectedPlan) {
      planSelect.value = selectedPlan;
      if (selectedAmount) {
        localStorage.setItem('wintech_selected_amount', selectedAmount);
      }
    }

    document.getElementById('signup').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

signupForm.addEventListener('submit', function (event) {
  event.preventDefault();
  handlePayment();
});

const savedPlan = localStorage.getItem('wintech_selected_amount');
if (savedPlan) {
  const selectedPlanName = Object.keys(PLAN_PRICES).find((key) => PLAN_PRICES[key] === Number(savedPlan));
  if (selectedPlanName) {
    planSelect.value = selectedPlanName;
  }
}
