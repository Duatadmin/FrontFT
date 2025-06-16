// convertKey.js
const crypto = require('crypto');

// ------------------------------------------------------------------------------------
// PASTE YOUR BASE64 ENCODED PKCS#1 PRIVATE KEY HERE
// This is the string from your .env that starts with:
// LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQo...
const base64Pkcs1KeyFromEnv = "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb3dJQkFBS0NBUUVBMmV4cWt0TDhzeC9ablIwUzJQK0tVeXJubEpPM1hFamYwMmU1dVVHcXJNam9PSDBCCnVtbWxyOGdRNlg3a2M4amhCRmEwbDkrdDJPUWNIakx6cmNMUTlIUjFVSEJ4ZWRvZ0hZMmkvTjBPUHI1dUdLL3IKWStYQk1yYkZrR0w1NEZMOEtGeDJoeHpYRERDSHA3L1pCMWg5dDVYeU0xSG9uc0Iya0s5ZWhHTzZDRk9vc0ZORQp2bGVyYlB4ZCtQQUFodVo0TXcyYzJJbUxBQnVySnpmM3hkbXpUcDR2KzdUd1ZCZGlUc3dwTHp5V0luSUYrK1hPCkFLZWlZSzJBY0RvL2kybmZHY1RsOGtqdFdhZkF5UDJGdDZvbjlhbG1hUjRvRnhxQURaZHZ1SXl3OE04VXpIK3AKajFZcktLWjRkSDR3T0h0TnRHVWVac2tyNUtFeTVtUTM0VXRmeHdJREFRQUJBb0lCQUIrekhWdVI0bDFpQ1lNcQpaVmFqSEJRZ3FSZ2xRVkVQYnJPWjk5dXV1dGVGMEFzcmhVZ0FYSVYzT2tmazJVYk53VGI0TDlrL0dkTHpkNTJkCm9YRzB1dUF4c3BaS3Q2UlhLa0J5UjhrSzZpcTVXUVdHb3R5TFlYRHhsNTBsc0ozRXp5dWJLNTRDMVhYNTl6bXgKRlZrQUI5QTFPUi9scEhZTW5yMUpncHUxR3F5MnplN1hTUk5ZaUxNblA3QlFCc3gwdHFIYlV1R3lLVGo5R255WQovWnA0cDdaTG5kWk0yYVZ1S2lLVHJSQmRXVWhLcFo1K0V3VXlnM2lPMlZ1dzh0eGJMWEZYdkNGeEJZOWZJOUVWCk9yUitTenFtck52NGtKN0lQWEs2aTVNNUFGZjF6QUFlZlFCeVNPVDBLQmFNdmxZSlArWTBNYzZzME9rNlYxNi8KRkRGaUxPMENnWUVBNzIyYXJjc2M5a3RSZGZLWkVjaU16NGpQNGkxR0pPTC9MdkJ5cXcxeXFhU0N2Z25zYnhFVQpveWFEMGg0c1lqa3JrUlNwMUdiVUE1Rno5eVIxbXpiTlN2SGxNdlovNEFpbFc0OWZObTZHS2h6NlM5RTIxa25hCnY3aWJEbGd5cHllZ1Rua1NEUjFPczJIQkhiejVqUldRSG1qT0VsMUNJMWR3Mk0vb00rQy9QVjBDZ1lFQTZRSEcKTVhpanZvWjJ5czFKcXh2VThpY0xZK0NwR2FZRUEyWUs2WXZsQm9oclluODJNdXdYTlJpdmlnd1NKQ2htcVRnawp2TUc0cERFVFFSY0pqQUdpQit2UXZ6T2d1ZzlHZVNUOEVOdkdXTmlKODUycmtvQXRyVmFlb0ZHTFc0cnc4eVdXCjMzZ21DVHBGWjNaYWQzcDBaMnVySzBWL1N2Tk1KYkd1aXRieUczTUNnWUJRSko3L0I1c0ZNa2J0TlN4WmtJaloKdXhEaXc0YlVPQXQwK2RWWVBtTWdOOG52dE1Db21NNFFvb2JEWVlnM3hLMDVuZklPLy9COTFVVTg5NzVLR3pqeQptaSsvTkZXdmR4VnFwWDRZYVR5TmdpK2lDMERRejkzaUNQZ1dBQjNNWis0MzlqeTltUTdMNnEvS3RZUE8zdVhqCjErOEtwSjdMMTZ3VlZ0cUI2dnY0blFLQmdRQ3NydTN0bUJUeWpNRFpTQTlDeXB1azR4N2o1SW91UWdWVFozcksKM3l6YkRKdFpJaUpPMXYzVUVmbDJlNyt1SUdzRkdtRFBxMXBtQlNEWjZuTGUyZzcxZytUdTd4bzlDamtXYXp5TQpXZlREdjZkdGJ2cksxa2dENE9BcXZJUmxVYkdFNGVUUXRVQ3JNZzVod1NzR3hUQWp2WDNiMGVPbTdtME91b0k2CnoxWWExUUtCZ0ZpbmhwRS9DVXhQS0QvaGcxWnd2REhNVE9vd3hjb3FmMnU4NWtOanorNzVQM3ByUmhUNlZwd2IKOFozQUlLVFpWVXB2V0l1aW1IUzhNV3gva2pBdk82NXoyMlplL3llcGJkUGZuSU1MSEh2NGpyRStZd0FwMU1vcwp4aEdmblVtTmNwdnhXRVAwNlJhVEtKMHFnd2JFa1gwNVFKdjZIUVBra2tIQ2k4L1BkTG9DCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCg";
// ------------------------------------------------------------------------------------

if (base64Pkcs1KeyFromEnv === "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb3dJQkFBS0NBUUVBMmV4cWt0TDhzeC9ablIwUzJQK0tVeXJubEpPM1hFamYwMmU1dVVHcXJNam9PSDBCCnVtbWxyOGdRNlg3a2M4amhCRmEwbDkrdDJPUWNIakx6cmNMUTlIUjFVSEJ4ZWRvZ0hZMmkvTjBPUHI1dUdLL3IKWStYQk1yYkZrR0w1NEZMOEtGeDJoeHpYRERDSHA3L1pCMWg5dDVYeU0xSG9uc0Iya0s5ZWhHTzZDRk9vc0ZORQp2bGVyYlB4ZCtQQUFodVo0TXcyYzJJbUxBQnVySnpmM3hkbXpUcDR2KzdUd1ZCZGlUc3dwTHp5V0luSUYrK1hPCkFLZWlZSzJBY0RvL2kybmZHY1RsOGtqdFdhZkF5UDJGdDZvbjlhbG1hUjRvRnhxQURaZHZ1SXl3OE04VXpIK3AKajFZcktLWjRkSDR3T0h0TnRHVWVac2tyNUtFeTVtUTM0VXRmeHdJREFRQUJBb0lCQUIrekhWdVI0bDFpQ1lNcQpaVmFqSEJRZ3FSZ2xRVkVQYnJPWjk5dXV1dGVGMEFzcmhVZ0FYSVYzT2tmazJVYk53VGI0TDlrL0dkTHpkNTJkCm9YRzB1dUF4c3BaS3Q2UlhLa0J5UjhrSzZpcTVXUVdHb3R5TFlYRHhsNTBsc0ozRXp5dWJLNTRDMVhYNTl6bXgKRlZrQUI5QTFPUi9scEhZTW5yMUpncHUxR3F5MnplN1hTUk5ZaUxNblA3QlFCc3gwdHFIYlV1R3lLVGo5R255WQovWnA0cDdaTG5kWk0yYVZ1S2lLVHJSQmRXVWhLcFo1K0V3VXlnM2lPMlZ1dzh0eGJMWEZYdkNGeEJZOWZJOUVWCk9yUitTenFtck52NGtKN0lQWEs2aTVNNUFGZjF6QUFlZlFCeVNPVDBLQmFNdmxZSlArWTBNYzZzME9rNlYxNi8KRkRGaUxPMENnWUVBNzIyYXJjc2M5a3RSZGZLWkVjaU16NGpQNGkxR0pPTC9MdkJ5cXcxeXFhU0N2Z25zYnhFVQpveWFEMGg0c1lqa3JrUlNwMUdiVUE1Rno5eVIxbXpiTlN2SGxNdlovNEFpbFc0OWZObTZHS2h6NlM5RTIxa25hCnY3aWJEbGd5cHllZ1Rua1NEUjFPczJIQkhiejVqUldRSG1qT0VsMUNJMWR3Mk0vb00rQy9QVjBDZ1lFQTZRSEcKTVhpanZvWjJ5czFKcXh2VThpY0xZK0NwR2FZRUEyWUs2WXZsQm9oclluODJNdXdYTlJpdmlnd1NKQ2htcVRnawp2TUc0cERFVFFSY0pqQUdpQit2UXZ6T2d1ZzlHZVNUOEVOdkdXTmlKODUycmtvQXRyVmFlb0ZHTFc0cnc4eVdXCjMzZ21DVHBGWjNaYWQzcDBaMnVySzBWL1N2Tk1KYkd1aXRieUczTUNnWUJRSko3L0I1c0ZNa2J0TlN4WmtJaloKdXhEaXc0YlVPQXQwK2RWWVBtTWdOOG52dE1Db21NNFFvb2JEWVlnM3hLMDVuZklPLy9COTFVVTg5NzVLR3pqeQptaSsvTkZXdmR4VnFwWDRZYVR5TmdpK2lDMERRejkzaUNQZ1dBQjNNWis0MzlqeTltUTdMNnEvS3RZUE8zdVhqCjErOEtwSjdMMTZ3VlZ0cUI2dnY0blFLQmdRQ3NydTN0bUJUeWpNRFpTQTlDeXB1azR4N2o1SW91UWdWVFozcksKM3l6YkRKdFpJaUpPMXYzVUVmbDJlNyt1SUdzRkdtRFBxMXBtQlNEWjZuTGUyZzcxZytUdTd4bzlDamtXYXp5TQpXZlREdjZkdGJ2cksxa2dENE9BcXZJUmxVYkdFNGVUUXRVQ3JNZzVod1NzR3hUQWp2WDNiMGVPbTdtME91b0k2CnoxWWExUUtCZ0ZpbmhwRS9DVXhQS0QvaGcxWnd2REhNVE9vd3hjb3FmMnU4NWtOanorNzVQM3ByUmhUNlZwd2IKOFozQUlLVFpWVXB2V0l1aW1IUzhNV3gva2pBdk82NXoyMlplL3llcGJkUGZuSU1MSEh2NGpyRStZd0FwMU1vcwp4aEdmblVtTmNwdnhXRVAwNlJhVEtKMHFnd2JFa1gwNVFKdjZIUVBra2tIQ2k4L1BkTG9DCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCg" || !base64Pkcs1KeyFromEnv) {
    console.error("ERROR: Please open convertKey.js and replace 'PASTE_YOUR_BASE64_ENCODED_PKCS1_KEY_HERE' with your actual base64 encoded PKCS#1 key from your .env file.");
    process.exit(1);
}

try {
    // 1. Decode the base64 PKCS#1 key to its PEM string format
    const pkcs1Pem = Buffer.from(base64Pkcs1KeyFromEnv, 'base64').toString('utf-8');
    
    // 2. Import the PKCS#1 PEM key using Node.js crypto
    const privateKeyObject = crypto.createPrivateKey({
        key: pkcs1Pem,
        format: 'pem' // Node.js can usually infer PKCS#1 from the PEM headers
    });

    // 3. Export the key in PKCS#8 PEM format
    // This is the crucial conversion step
    const pkcs8Pem = privateKeyObject.export({
        type: 'pkcs8',
        format: 'pem'
    });
    
    // 4. Base64 encode the PKCS#8 PEM string for Supabase
    const base64Pkcs8KeyForSupabase = Buffer.from(pkcs8Pem).toString('base64');

    console.log("\nSuccessfully converted key!");
    console.log("------------------------------------------------------------------------------------");
    console.log("Base64 encoded PKCS#8 key for Supabase 'CF_STREAM_SIGN_KEY' secret:");
    console.log("------------------------------------------------------------------------------------");
    console.log(base64Pkcs8KeyForSupabase);
    console.log("------------------------------------------------------------------------------------");
    console.log("\nACTION: Copy the long single-line base64 string printed above.");
    console.log("Then, go to your Supabase dashboard, edit the 'CF_STREAM_SIGN_KEY' secret,");
    console.log("and paste this new value. Save, then redeploy your Edge Function.");

} catch (error) {
    console.error("\nError during key conversion:", error.message);
    if (error.code === 'ERR_OSSL_PEM_NO_START_LINE' || error.message.includes('PEM_read_bio_PrivateKey') || error.message.includes('PEM routines')) {
        console.error("This error often means the input key (after base64 decoding) is not a valid PEM private key, or it might be password-protected (this script does not handle encrypted keys).");
        console.error("Ensure the 'base64Pkcs1KeyFromEnv' variable in the script contains the correct and complete base64 string from your .env file.");
    } else if (error.message.includes('bad base-64')) {
         console.error("This error suggests the string you pasted for 'base64Pkcs1KeyFromEnv' is not valid base64. Please double-check it.");
    } else {
        console.error("An unexpected error occurred. Please check the input key and script.");
    }
    process.exit(1);
}