# বং Chingzz - Upstash Redis Setup Guide for Vercel

## How to connect Upstash Redis in 60 seconds (100% Free, No Credit Card):

### Option A: From Vercel Dashboard (Easiest - 1 Click)
1. Open your project on [vercel.com](https://vercel.com).
2. Go to the **Storage** tab at the top.
3. Click **Create Database** and choose **Upstash** (or **Redis**).
4. Click **Connect** to your project.
5. Vercel automatically sets `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your project environment variables.
6. (Optional) In **Settings > Environment Variables**, add `ADMIN_PIN` with your custom PIN (default is `1234`).
7. Redeploy the project.

---

### Option B: From Upstash.com (Free Account)
1. Go to [upstash.com](https://upstash.com) and log in (with Google/GitHub, no credit card needed).
2. Click **Create Database**:
   - Name: `bongchingzz-status`
   - Region: Select nearest (e.g. AWS Mumbai / ap-south-1)
   - Type: Regional (Free)
3. Under the **REST API** tab on your database page, copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. In your Vercel project: **Settings > Environment Variables**, paste both variables.
5. Redeploy.

---

## How to Use the Kitchen Switch:
- Visit: `https://your-domain.vercel.app/admin`
- Enter your PIN (Default: `1234`).
- Flip the switch to **Open** or **Closed**.
- (Optional) Pick a preset message or write a custom notice.
- Click **Save & Update Website**.
- Your customer website updates in real time!

