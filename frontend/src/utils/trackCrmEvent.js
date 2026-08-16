/**
 * Send interactive tracking event from Apple Landing Page to CRM Backend
 * Endpoint: POST /api/v1/crm/track
 */
export async function trackCrmEvent({ email, name, phone, productInterest, activityType, metadata }) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/crm/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email || 'visitor@apple.com',
        name: name || 'Khách Ghé Trải Nghiệm',
        phone: phone || null,
        productInterest: productInterest || 'iPhone 17 Pro Max 256GB',
        activityType: activityType || 'view_product',
        metadata: metadata || {}
      })
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error tracking CRM event:', err);
    return null;
  }
}
