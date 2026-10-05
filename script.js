const PLAN_PRICES = {
  Starter: 3000,
  Plus: 5000,
  Pro: 7000,
  Premium: 11000,
};

const BANK_DETAILS = {
  accountName: 'Chisom Anderson Ezurike',
  accountNumber: '2016868423',
  bankName: 'Kuda MFB',
  bankCode: '50211',
};

const planSelect = document.getElementById('plan');
const signupForm = document.getElementById('signupForm');
const successMessage = document.getElementById('successMessage');

function showBankTransferDetails(plan, amount, fullName, email) {
  successMessage.innerHTML = `
    <h3 style="margin-bottom: 12px; color: var(--brand);">Registration Confirmed!</h3>
    <p style="margin-bottom: 14px; color: var(--text);">Hi ${fullName}, your ${plan} membership registration has been received.</p>

    <div style="background: rgba(53,224,161,0.1); border: 1px solid rgba(53,224,161,0.22); border-radius: 12px; padding: 16px; margin-bottom: 14px;">
      <p style="color: var(--muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">Bank Transfer Details</p>
      <p style="color: var(--text); margin-bottom: 8px;"><strong>Account Name:</strong> ${BANK_DETAILS.accountName}</p>
      <p style="color: var(--text); margin-bottom: 8px;"><strong>Account Number:</strong> <code style="background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 6px;">${BANK_DETAILS.accountNumber}</code></p>
      <p style="color: var(--text); margin-bottom: 8px;"><strong>Bank Name:</strong> ${BANK_DETAILS.bankName}</p>
      <p style="color: var(--text); margin-bottom: 8px;"><strong>Bank Code:</strong> ${BANK_DETAILS.bankCode}</p>
      <p style="color: var(--text);"><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
    </div>

    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 10px;">Please transfer exactly ₦${amount.toLocaleString()} to the account above. Once we receive your payment, your ${plan} membership will be activated.</p>
    <p style="color: var(--muted); font-size: 0.85rem;">A confirmation email has been sent to <strong>${email}</strong>.</p>
  `;

  successMessage.classList.add('show');
}

function handleSubmission() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const plan = planSelect.value;
  const message = document.getElementById('message').value.trim();

  if (!fullName || !email || !phone || !plan) {
    alert('Please fill in your full name, email, phone number, and select a plan.');
    return;
  }

  const amount = PLAN_PRICES[plan];

  if (!amount || amount <= 0) {
    alert('Please select a valid membership plan.');
    return;
  }

  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName,
      email,
      phone,
      plan,
      amount,
      message,
      registrationDate: new Date().toISOString(),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showBankTransferDetails(plan, amount, fullName, email);
        fetch('/api/send-registration-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            fullName,
            plan,
            amount,
            bankDetails: BANK_DETAILS,
          }),
        }).catch((error) => console.error('Email notification error:', error));

        signupForm.reset();
        planSelect.value = 'Pro';
      } else {
        alert('Registration failed. Please try again.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    });
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
  handleSubmission();
});

const savedPlan = localStorage.getItem('wintech_selected_amount');
if (savedPlan) {
  const selectedPlanName = Object.keys(PLAN_PRICES).find((key) => PLAN_PRICES[key] === Number(savedPlan));
  if (selectedPlanName) {
    planSelect.value = selectedPlanName;
  }
}
