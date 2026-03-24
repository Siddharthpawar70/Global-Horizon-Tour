# Global Horizon Tour

## What was fixed
- Registration and login now use a real PHP + MySQL backend (`backend/api/register.php`, `backend/api/login.php`).
- Booking, admin packages, admin customers, admin bookings, dashboard stats, ticket and receipt pages now read/write live DB data.
- Currency conversion and country-driven language preferences were added to booking.
- Payment flow now handles `success`, `failed`, and `pending` states and stores transactions.
- Receipt page added: `receipt.html`.

## Backend setup
1. Import schema:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```
2. Configure DB env vars (optional defaults shown):
   ```bash
   export DB_HOST=127.0.0.1
   export DB_PORT=3306
   export DB_NAME=global_horizon_tour
   export DB_USER=root
   export DB_PASS=
   ```
3. Start PHP server from repo root:
   ```bash
   php -S 127.0.0.1:8000
   ```
4. Open `http://127.0.0.1:8000/register.html`.

## API endpoints
- `POST backend/api/register.php`
- `POST backend/api/login.php`
- `GET/POST/PUT/DELETE backend/api/packages.php`
- `GET/POST/DELETE backend/api/bookings.php`
- `GET/PATCH backend/api/users.php`
- `POST backend/api/payment.php`
- `GET backend/api/receipt.php?booking_code=...`

## Notes about payment gateway
- This version provides a server-validated payment state workflow and transaction IDs.
- To connect to live Razorpay/Stripe, replace the simulated status generation in `js/booking.js` + `backend/api/payment.php` with official SDK calls and your test/live keys.
